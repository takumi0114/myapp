package models

import kotlinx.serialization.Serializable
import java.time.LocalDateTime

@Serializable
data class TodoDTO(
    val id: Int? = null,
    val title: String,
    val description: String? = null,
    val completed: Boolean = false,
    val priority: Int = 1,
)