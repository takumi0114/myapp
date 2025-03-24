package routes

import models.HabitDTO
import models.HabitAchievementDTO
import services.HabitService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.util.UUID

fun Route.habitRoutes() {
    val habitService = HabitService()
    
    route("/api/habits") {
        // 習慣一覧の取得
        get {
            call.respond(habitService.getAllHabits())
        }
        
        // 習慣の新規作成
        post {
            val habit = call.receive<HabitDTO>()
            call.respond(HttpStatusCode.Created, habitService.createHabit(habit))
        }
        
        // 特定の習慣の取得
        get("/{id}") {
            val id = call.parameters["id"]
            if (id == null) {
                call.respond(HttpStatusCode.BadRequest, "Invalid ID")
                return@get
            }
            
            try {
                val habit = habitService.getHabit(id)
                if (habit != null) {
                    call.respond(habit)
                } else {
                    call.respond(HttpStatusCode.NotFound, "Habit not found")
                }
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, "Invalid UUID format")
            }
        }
        
        // 習慣の更新
        put("/{id}") {
            val id = call.parameters["id"]
            if (id == null) {
                call.respond(HttpStatusCode.BadRequest, "Invalid ID")
                return@put
            }
            
            try {
                val habit = call.receive<HabitDTO>()
                val success = habitService.updateHabit(id, habit)
                
                if (success) {
                    call.respond(HttpStatusCode.OK, mapOf("message" to "Habit updated successfully"))
                } else {
                    call.respond(HttpStatusCode.NotFound, "Habit not found")
                }
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, "Invalid UUID format")
            }
        }
        
        // 習慣の削除
        delete("/{id}") {
            val id = call.parameters["id"]
            if (id == null) {
                call.respond(HttpStatusCode.BadRequest, "Invalid ID")
                return@delete
            }
            
            try {
                val success = habitService.deleteHabit(id)
                
                if (success) {
                    call.respond(HttpStatusCode.OK, mapOf("message" to "Habit deleted successfully"))
                } else {
                    call.respond(HttpStatusCode.NotFound, "Habit not found")
                }
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, "Invalid UUID format")
            }
        }

        // 達成記録を取得
        get("/{id}/achievements") {
            val id = call.parameters["id"] 
                ?: return@get call.respond(HttpStatusCode.BadRequest, mapOf("error" to "無効なID"))
            
            try {
                val achievements = habitService.getHabitAchievements(id)
                call.respond(achievements)
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to "無効なUUID形式"))
            } catch (e: Exception) {
                call.application.log.error("達成記録の取得中にエラーが発生しました", e)
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "達成記録の取得中にエラーが発生しました"))
            }
        }

        // 習慣のルートに追加（route("/api/habits") の中）
        // 達成状況を更新
        post("/{id}/achievements") {
            val id = call.parameters["id"]
                ?: return@post call.respond(HttpStatusCode.BadRequest, mapOf("error" to "無効なID"))
            
            try {
                val date = call.receive<HabitAchievementDTO>()
                
                // リクエストのhabitIdとパスパラメータのidが一致することを確認
                if (date.habitId != id) {
                    call.respond(HttpStatusCode.BadRequest, mapOf("error" to "habitIdが一致しません"))
                    return@post
                }
                
                val updatedAchievement = habitService.updateHabitAchievement(
                    id,
                    date.achievementDate,
                    date.achieved
                )
                
                call.respond(updatedAchievement)
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to "無効なデータ形式"))
            } catch (e: ContentTransformationException) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to "無効なリクエスト形式"))
            } catch (e: Exception) {
                call.application.log.error("達成状況の更新中にエラーが発生しました", e)
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "達成状況の更新中にエラーが発生しました"))
            }
        }
    }
}