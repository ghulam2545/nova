package com.ghulam.nova.app.utils;

import java.security.SecureRandom;

public class CommonUtils {

    private static final SecureRandom RANDOM = new SecureRandom();

    public static int nextInt(int low, int high) {
        return RANDOM.nextInt(low, high + 1);
    }

    public static String nextInt(int count) {
        StringBuilder digits = new StringBuilder(count);
        for (int i = 0; i < count; i++) {
            digits.append(RANDOM.nextInt(10));
        }

        return digits.toString();
    }

}
