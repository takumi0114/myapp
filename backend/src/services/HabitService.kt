package services

import models.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.LocalDateTime
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.UUID

class HabitService {
    
    private val dateFormatter = DateTimeFormatter.ISO_DATE_TIME
    
    // 習慣の一覧を取得
    fun getAllHabits(): List<HabitDTO> = transaction {
        Habits.selectAll().map { row ->
            HabitDTO(
                id = row[Habits.id].value.toString(),
                title = row[Habits.title],
                description = row[Habits.description],
                createdAt = row[Habits.createdAt].format(dateFormatter)
            )
        }
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

    // 習慣の達成記録を取得
    fun getHabitAchievements(habitId: String): List<HabitAchievementDTO> = transaction {
        val uuid = UUID.fromString(habitId)
        
        HabitAchievements
            .select { HabitAchievements.habitId eq uuid }
            .map { row ->
                HabitAchievementDTO(
                    id = row[HabitAchievements.id].value.toString(),
                    habitId = habitId,
                    achievementDate = row[HabitAchievements.achievementDate].toString(),
                    achieved = row[HabitAchievements.achieved]
                )
            }
    }

    // 習慣の達成状況を更新または作成
    fun updateHabitAchievement(habitId: String, date: String, achieved: Boolean): HabitAchievementDTO = transaction {
        val uuid = UUID.fromString(habitId)
        val localDate = LocalDate.parse(date)
        
        // 既存のレコードを探す
        val existingRecord = HabitAchievements
            .select { (HabitAchievements.habitId eq uuid) and (HabitAchievements.achievementDate eq localDate) }
            .singleOrNull()
        
        if (existingRecord != null) {
            // 既存のレコードを更新
            HabitAchievements.update({ (HabitAchievements.habitId eq uuid) and (HabitAchievements.achievementDate eq localDate) }) {
                it[HabitAchievements.achieved] = achieved
            }
            
            HabitAchievementDTO(
                id = existingRecord[HabitAchievements.id].value.toString(),
                habitId = habitId,
                achievementDate = date,
                achieved = achieved
            )
        } else {
            // 新しいレコードを作成
            val id = UUID.randomUUID()
            HabitAchievements.insert {
                it[HabitAchievements.id] = id
                it[HabitAchievements.habitId] = uuid
                it[HabitAchievements.achievementDate] = localDate
                it[HabitAchievements.achieved] = achieved
            }
            
            HabitAchievementDTO(
                id = id.toString(),
                habitId = habitId,
                achievementDate = date,
                achieved = achieved
            )
        }
    }
}