package com.example.sms;

import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.SwingUtilities;
import java.awt.BorderLayout;
import java.awt.GraphicsEnvironment;

public class App {
    public static void main(String[] args) {
        if (GraphicsEnvironment.isHeadless()) {
            System.out.println("Student Management System starting in headless mode. GUI will not be displayed.");
            return;
        }

        SwingUtilities.invokeLater(() -> {
            JFrame frame = new JFrame("Student Management System");
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            frame.setLayout(new BorderLayout());
            frame.add(new JLabel("Welcome to the Student Management System"), BorderLayout.CENTER);
            frame.setSize(640, 400);
            frame.setLocationRelativeTo(null);
            frame.setVisible(true);
        });
    }
}

