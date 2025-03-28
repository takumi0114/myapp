package models

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.javatime.*
import java.time.LocalDateTime
import java.time.Duration
import java.util.UUID

// 習慣の詳細記録のテーブル
object HabitDetails : UUIDTable() {
  // 　sql内ではスネークケースが一般的である
  // 　habitIdはkotlin内で使用する変数
  // 　habit_idは実際のデータベースで使用されるカラム名
    val habitId = reference("habit_id", Habits)
    val achievementDate = date("date")
    val notes = text("notes").nullable()  // テキスト記録
    val duration = integer("duration_minutes").nullable()  // 時間（分単位で保存）
    val photo = varchar("photo_path", 255).nullable()  // 写真のファイルパス
    val createdAt = datetime("created_at").default(LocalDateTime.now())
    
    // 同じ習慣の同じ日付に複数の詳細記録ができないようにする
    init {
        uniqueIndex(habitId, achievementDate)
    }
}

// 習慣の詳細記録のDTO
@Serializable
data class HabitDetailDTO(
    val id: String? = null,
    val habitId: String,
    val achievementDate: String,
    val notes: String? = null,
    val duration: Int? = null,  // 時間を分単位で保存
    val photo: String? = null
)