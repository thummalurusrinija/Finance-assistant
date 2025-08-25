# Student Management System (Java Swing + JDBC + MySQL)

Desktop application for managing students, courses, marks, attendance, and reports.

## Prerequisites
- Java 21+ (JDK)
- Maven (optional; project structure is Maven-ready)

If Maven is unavailable on your machine, you can still compile and run the basic app with `javac` and `java` as shown below. Later, install Maven to use dependencies (e.g., MySQL driver) and packaging.

## Run a quick smoke test (no external deps needed)
```bash
# From project root
mkdir -p target/classes
javac -d target/classes $(find src/main/java -name "*.java")
java -cp target/classes com.example.sms.App
```

The app detects headless environments and prints a message instead of opening a window when no display is available.

## Build with Maven (once Maven is installed)
```bash
mvn -q -e -DskipTests package
java -jar target/student-management-system-0.1.0-SNAPSHOT.jar
```

## Next steps
- Add DB config and connection manager
- Implement DAOs for students, courses, marks, attendance
- Create Swing UI with tabs and CRUD workflows
- Wire business logic for grading and reporting