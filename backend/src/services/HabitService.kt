package services

import models.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.LocalDateTime
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.UUID
// javaの標準ライブラリの標準ライブラリ
import java.io.File

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

    // 習慣と関連する全ての詳細記録を削除
    fun deleteHabit(id: String): Boolean = transaction {
        val uuid = UUID.fromString(id)
        
        // まず関連する詳細記録を削除
        HabitDetails.deleteWhere { HabitDetails.habitId eq uuid }
        
        // 関連する達成記録も削除（もし存在する場合）
        HabitAchievements.deleteWhere { HabitAchievements.habitId eq uuid }
        
        // 最後に習慣自体を削除
        val deletedRows = Habits.deleteWhere { Habits.id eq uuid }
        
        // 削除された行数が0より大きければ成功
        deletedRows > 0
    }

    // 特定の習慣の特定日の詳細記録を削除
    fun deleteHabitDetail(habitId: String, date: String): Boolean = transaction {
        val uuid = UUID.fromString(habitId)
        val localDate = LocalDate.parse(date)

        // まず詳細を取得して、画像パスがあれば削除
        val detail = HabitDetails
            .select { (HabitDetails.habitId eq uuid) and (HabitDetails.achievementDate eq localDate) }
            .singleOrNull()
        
        if (detail != null) {
            val photoPath = detail[HabitDetails.photo]
            if (photoPath != null) {
                // 画像ファイルを削除
                val file = File(photoPath)
                if (file.exists()) {
                    file.delete()
                }
            }
        }
        
        // 指定された習慣と日付の詳細記録を削除
        val deletedRows = HabitDetails.deleteWhere { 
            (HabitDetails.habitId eq uuid) and (HabitDetails.achievementDate eq localDate)
        }
        
        // 削除された行数が0より大きければ成功
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


    fun createHabitDetail(habitDetail: HabitDetailDTO): HabitDetailDTO = transaction {
        
        // 新しいレコードを作成
        val detailId = UUID.randomUUID()
        val uuid = UUID.fromString(habitDetail.habitId)
        val detailDate = LocalDate.parse(habitDetail.achievementDate)
        
        try {
            HabitDetails.insert {
                it[id] = detailId
                it[habitId] = uuid
                it[achievementDate] = detailDate
                it[notes] = habitDetail.notes
                it[duration] = habitDetail.duration
                it[photo] = habitDetail.photo
            }
            
            println("詳細記録の保存に成功しました")
            
            habitDetail.copy(id = detailId.toString())
        } catch (e: Exception) {
            println("詳細記録の保存中にエラーが発生しました: ${e.message}")
            e.printStackTrace()
            // エラーが発生した場合も何かを返す必要がある
            throw e  // 例外を再スローして上位で処理できるようにする
        }
    }

    // 習慣の全詳細を取得
    fun getHabitDetails(habitId: String): List<HabitDetailDTO> = transaction {
        val uuid = UUID.fromString(habitId)
        
        HabitDetails
            .select { HabitDetails.habitId eq uuid }
            .map { row ->
                HabitDetailDTO(
                    id = row[HabitDetails.id].value.toString(),
                    habitId = habitId,
                    achievementDate = row[HabitDetails.achievementDate].toString(),
                    notes = row[HabitDetails.notes],
                    duration = row[HabitDetails.duration],
                    photo = row[HabitDetails.photo]
                )
            }
    }
}