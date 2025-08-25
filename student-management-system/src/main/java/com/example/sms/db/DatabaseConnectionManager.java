package com.example.sms.db;

import com.example.sms.config.DatabaseConfig;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnectionManager {
    private final DatabaseConfig config;

    public DatabaseConnectionManager() {
        this.config = new DatabaseConfig();
    }

    public DatabaseConnectionManager(DatabaseConfig config) {
        this.config = config;
    }

    public Connection getConnection() throws SQLException {
        if (!config.isConfigured()) {
            throw new IllegalStateException("Database is not configured. Set db.properties or environment variables.");
        }

        try {
            Class.forName(config.getDriverClass());
        } catch (ClassNotFoundException e) {
            throw new IllegalStateException("JDBC Driver not found: " + config.getDriverClass() + ". Ensure MySQL connector is on the classpath.", e);
        }

        String url = config.getUrl();
        String username = config.getUsername();
        String password = config.getPassword();

        return DriverManager.getConnection(url, username, password);
    }
}

