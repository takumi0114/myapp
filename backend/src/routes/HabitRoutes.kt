package routes

import models.HabitDTO
import services.HabitService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.util.UUID

fun Route.habitRoutes() {
    val habitService = HabitService()
    println("確認したい確認したい確認したい確認したい確認したい確認したい確認したい確認したい確認したい確認したい")
    
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
            println("この部分にIDが入りますこの部分にIDが入りますこの部分にIDが入りますこの部分にIDが入りますこの部分にIDが入ります", id)
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
    }
}