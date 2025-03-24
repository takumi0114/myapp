package models

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.javatime.*
import java.time.LocalDateTime
import java.util.UUID

// 既存コードの下に追加
// 達成記録のテーブル
object HabitAchievements : UUIDTable() {
    val habitId = reference("habit_id", Habits)
    val achievementDate = date("date")
    val achieved = bool("achieved")
    val createdAt = datetime("created_at").default(LocalDateTime.now())

    
    // 同じ習慣の同じ日付に複数の記録ができないようにする
    init {
        uniqueIndex(habitId, achievementDate)
    }
}

// 達成記録のDTO
@Serializable
data class HabitAchievementDTO(
    val id: String? = null,
    val habitId: String,
    val achievementDate: String,
    val achieved: Boolean
)