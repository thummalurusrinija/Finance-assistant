package com.example.sms.config;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class DatabaseConfig {
    private final Properties properties = new Properties();

    public DatabaseConfig() {
        try (InputStream in = getClass().getClassLoader().getResourceAsStream("db.properties")) {
            if (in != null) {
                properties.load(in);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to load db.properties", e);
        }
    }

    public boolean isConfigured() {
        return getUrl() != null && !getUrl().isBlank();
    }

    public String getUrl() {
        return properties.getProperty("db.url", System.getenv("SMS_DB_URL"));
    }

    public String getUsername() {
        return properties.getProperty("db.username", System.getenv("SMS_DB_USERNAME"));
    }

    public String getPassword() {
        return properties.getProperty("db.password", System.getenv("SMS_DB_PASSWORD"));
    }

    public String getDriverClass() {
        return properties.getProperty("db.driverClass", System.getenv().getOrDefault("SMS_DB_DRIVER", "com.mysql.cj.jdbc.Driver"));
    }
}

