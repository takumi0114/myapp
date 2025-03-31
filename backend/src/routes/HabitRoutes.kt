package routes

import models.*
import services.HabitService
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.util.UUID
import java.io.File

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
                    call.respond(HttpStatusCode.OK, mapOf("message" to "習慣を削除しました"))
                } else {
                    call.respond(HttpStatusCode.NotFound, "習慣が見つかりません")
                }
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, "無効なIDです")
            }
        }

        // 特定の日付の詳細記録の削除
        delete("/{id}/details/{date}") {
            val id = call.parameters["id"] ?: return@delete call.respond(HttpStatusCode.BadRequest, "無効なID")
            val date = call.parameters["date"] ?: return@delete call.respond(HttpStatusCode.BadRequest, "無効な日付")
            
            try {
                val success = habitService.deleteHabitDetail(id, date)
                if (success) {
                    call.respond(HttpStatusCode.OK, mapOf("message" to "詳細記録を削除しました"))
                } else {
                    call.respond(HttpStatusCode.NotFound, "詳細記録が見つかりません")
                }
            } catch (e: Exception) {
                call.application.log.error("詳細記録の削除中にエラーが発生しました", e)
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "詳細記録の削除中にエラーが発生しました"))
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
            } catch (e: Exception) {
                call.application.log.error("達成状況の更新中にエラーが発生しました", e)
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "達成状況の更新中にエラーが発生しました"))
            }
        }

        // 詳細記録を作成
        post("/{id}/details/{today}") {
            val id = call.parameters["id"] ?: return@post call.respond(HttpStatusCode.BadRequest, "無効なID")
            val today = call.parameters["today"] ?: return@post call.respond(HttpStatusCode.BadRequest, "無効な日付")
            
            try {
                // データを格納する変数
                var habitId = ""
                var achievementDate = ""
                var notes: String? = null
                var duration: Int? = null
                var photoPath: String? = null
                
                // マルチパートデータを処理
                call.receiveMultipart().forEachPart { part ->
                    when (part) {
                        // テキストフィールドの処理
                        is PartData.FormItem -> {
                            when (part.name) {
                                "habitId" -> habitId = part.value
                                "achievementDate" -> achievementDate = part.value
                                "notes" -> notes = part.value
                                "duration" -> duration = part.value.toIntOrNull()
                            }
                        }
                        // ファイルの処理
                        is PartData.FileItem -> {
                            if (part.name == "photo" && part.originalFileName != null) {
                                // 保存先ディレクトリ
                                val uploadDir = File("./uploads").apply { mkdirs() }
                                
                                // ファイル名とパスを設定
                                val fileName = "${UUID.randomUUID()}_${part.originalFileName}"
                                val file = File(uploadDir, fileName)
                                
                                // ファイルを保存
                                part.streamProvider().use { input ->
                                    file.outputStream().use { output -> input.copyTo(output) }
                                }
                                
                                photoPath = "uploads/$fileName"
                            }
                        }
                        else -> {}
                    }
                    part.dispose() // 重要: メモリリークを防ぐ
                }
                
                // DTOを作成
                val habitDetail = HabitDetailDTO(
                    habitId = habitId,
                    achievementDate = achievementDate,
                    notes = notes,
                    duration = duration,
                    photo = photoPath
                )
                
                // データベースに保存
                val result = habitService.createHabitDetail(habitDetail)
                call.respond(HttpStatusCode.Created, result)
                
            } catch (e: Exception) {
                call.application.log.error("エラー: ${e.message}", e)
                call.respond(HttpStatusCode.InternalServerError, "サーバーエラー: ${e.message}")
            }
        }

        // 習慣の全詳細を取得
        get("/{id}/details") {
            val id = call.parameters["id"] ?: return@get call.respond(HttpStatusCode.BadRequest, "無効なID")
            
            try {
                val details = habitService.getHabitDetails(id)
                call.respond(details)
            } catch (e: Exception) {
                call.application.log.error("詳細の取得中にエラーが発生しました", e)
                call.respond(HttpStatusCode.InternalServerError, "詳細の取得中にエラーが発生しました")
            }
        }
    }
}