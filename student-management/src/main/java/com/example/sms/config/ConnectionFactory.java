package com.example.sms.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * Provides a singleton HikariCP-backed DataSource and connections.
 */
public final class ConnectionFactory {
    private static volatile HikariDataSource dataSource;

    private ConnectionFactory() {}

    public static DataSource getDataSource() {
        if (dataSource == null) {
            synchronized (ConnectionFactory.class) {
                if (dataSource == null) {
                    dataSource = createDataSource();
                }
            }
        }
        return dataSource;
    }

    public static Connection getConnection() throws SQLException {
        return getDataSource().getConnection();
    }

    private static HikariDataSource createDataSource() {
        DatabaseConfig config = new DatabaseConfig();
        HikariConfig hikari = new HikariConfig();
        hikari.setJdbcUrl(config.getJdbcUrl());
        hikari.setUsername(config.getJdbcUsername());
        hikari.setPassword(config.getJdbcPassword());
        hikari.setMaximumPoolSize(config.getMaximumPoolSize());
        hikari.setMinimumIdle(config.getMinimumIdle());
        hikari.setConnectionTimeout(config.getConnectionTimeoutMs());
        hikari.setIdleTimeout(config.getIdleTimeoutMs());
        hikari.setMaxLifetime(config.getMaxLifetimeMs());
        hikari.setPoolName("SMS-HikariPool");
        return new HikariDataSource(hikari);
    }
}

