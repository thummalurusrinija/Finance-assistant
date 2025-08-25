package com.example.sms.config;

import java.io.IOException;
import java.io.InputStream;
import java.util.Objects;
import java.util.Properties;

/**
 * Loads database configuration from classpath resource db.properties.
 */
public final class DatabaseConfig {
    private static final String PROPERTIES_PATH = "/db.properties";

    private final Properties properties;

    public DatabaseConfig() {
        this.properties = new Properties();
        try (InputStream inputStream = DatabaseConfig.class.getResourceAsStream(PROPERTIES_PATH)) {
            if (inputStream == null) {
                throw new IllegalStateException("Missing resource: " + PROPERTIES_PATH);
            }
            this.properties.load(inputStream);
        } catch (IOException ex) {
            throw new RuntimeException("Failed to load database properties", ex);
        }
    }

    public String getJdbcUrl() {
        return getRequired("jdbc.url");
    }

    public String getJdbcUsername() {
        return getRequired("jdbc.username");
    }

    public String getJdbcPassword() {
        return properties.getProperty("jdbc.password", "");
    }

    public int getMaximumPoolSize() {
        return Integer.parseInt(properties.getProperty("pool.maximumPoolSize", "10"));
    }

    public int getMinimumIdle() {
        return Integer.parseInt(properties.getProperty("pool.minimumIdle", "2"));
    }

    public long getConnectionTimeoutMs() {
        return Long.parseLong(properties.getProperty("pool.connectionTimeoutMs", "30000"));
    }

    public long getIdleTimeoutMs() {
        return Long.parseLong(properties.getProperty("pool.idleTimeoutMs", "600000"));
    }

    public long getMaxLifetimeMs() {
        return Long.parseLong(properties.getProperty("pool.maxLifetimeMs", "1800000"));
    }

    private String getRequired(String key) {
        String value = properties.getProperty(key);
        if (value == null || value.isEmpty()) {
            throw new IllegalStateException("Missing required property: " + key);
        }
        return value;
    }
}

