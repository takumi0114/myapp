package services

import models.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.UUID

class HabitService {
    
    private val dateFormatter = DateTimeFormatter.ISO_DATE_TIME
    
    // 習慣の一覧を取得
    fun getAllHabits(): List<HabitDTO> = transaction {
        val habit = Habits.selectAll().map { row ->
            val habitId = row[Habits.id].value

            HabitDTO(
                id = habitId.toString(),
                title = row[Habits.title],
                description = row[Habits.description],
                createdAt = row[Habits.createdAt].format(dateFormatter)
            )
        }
        println(habit)
    }
    
    // 習慣の詳細を取得
    fun getHabit(id: String): HabitDTO? = transaction {
        val uuid = UUID.fromString(id)
        Habits.select { Habits.id eq uuid }
            .mapNotNull { row ->
                HabitDTO(
                    id = row[Habits.id].value.toString(),
                    title = row[Habits.title],
                    description = row[Habits.description],
                    createdAt = row[Habits.createdAt].format(dateFormatter)
                )
            }
            .singleOrNull()
    }
    
    // 習慣を作成
    fun createHabit(habit: HabitDTO): HabitDTO = transaction {
        val uuid = UUID.randomUUID()
        
        Habits.insert {
            it[id] = uuid
            it[title] = habit.title
            it[description] = habit.description
        }
        
        habit.copy(id = uuid.toString(), createdAt = LocalDateTime.now().format(dateFormatter))
    }
    
    // 習慣を更新
    fun updateHabit(id: String, habit: HabitDTO): Boolean = transaction {
        val uuid = UUID.fromString(id)
        val updatedRows = Habits.update({ Habits.id eq uuid }) {
            it[title] = habit.title
            it[description] = habit.description
        }
        
        updatedRows > 0
    }
    
    // 習慣を削除
    fun deleteHabit(id: String): Boolean = transaction {
        val uuid = UUID.fromString(id)
        val deletedRows = Habits.deleteWhere { Habits.id eq uuid }
        
        deletedRows > 0
    }
}