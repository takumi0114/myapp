package models

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.javatime.datetime
import java.time.LocalDateTime
import java.util.UUID

// データベーステーブル定義
object Habits : UUIDTable() {
    val title = varchar("title", 255)
    val description = text("description").nullable()
    val createdAt = datetime("created_at").default(LocalDateTime.now())
}

// APIレスポンス用のデータモデル DTO(データ転送オブジェクト)
@Serializable
data class HabitDTO(
    val id: String? = null,
    val title: String,
    val description: String? = null,
    val createdAt: String? = null
)