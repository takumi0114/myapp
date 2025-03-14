 plugins {
     kotlin("jvm") version "1.9.22"
     kotlin("plugin.serialization") version "1.9.22"
     application
 }

kotlin {
    jvmToolchain(21)
}

group = "com.example"
version = "0.0.1"

repositories {
    mavenCentral()
}

sourceSets {
    main {
        kotlin.srcDirs("src")
        resources.srcDirs("src/resources")
    }
}

tasks.register<JavaExec>("h2Console") {
    classpath = configurations.runtimeClasspath.get()
    mainClass.set("org.h2.tools.Console")
    args("-web", "-browser")
}

val ktorVersion = "2.2.4"
val exposedVersion = "0.41.1"
val h2Version = "2.1.214"

dependencies {
    implementation("io.ktor:ktor-server-core:$ktorVersion")
    implementation("io.ktor:ktor-server-netty:$ktorVersion")
    implementation("io.ktor:ktor-server-content-negotiation:$ktorVersion")
    implementation("io.ktor:ktor-serialization-kotlinx-json:$ktorVersion")
    implementation("io.ktor:ktor-server-cors:$ktorVersion")
    
    implementation("org.jetbrains.exposed:exposed-core:$exposedVersion")
    implementation("org.jetbrains.exposed:exposed-dao:$exposedVersion")
    implementation("org.jetbrains.exposed:exposed-jdbc:$exposedVersion")
    implementation("org.jetbrains.exposed:exposed-java-time:$exposedVersion")
    implementation("com.h2database:h2:$h2Version")
    
    implementation("ch.qos.logback:logback-classic:1.4.5")
    implementation("io.ktor:ktor-server-cors:$ktorVersion")
    
}

application {
    mainClass.set("ApplicationKt")
}