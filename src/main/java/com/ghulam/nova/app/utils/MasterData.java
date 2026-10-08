package com.ghulam.nova.app.utils;

import java.util.List;

public final class MasterData {

    public record StateSchema(String name, String code, String region) {
    }

    public static final List<StateSchema> STATES = List.of(
            new StateSchema("Maharashtra", "MH", "West"),
            new StateSchema("Delhi", "DL", "North"),
            new StateSchema("Karnataka", "KA", "South"),
            new StateSchema("Tamil Nadu", "TN", "South"),
            new StateSchema("Telangana", "TG", "South"),
            new StateSchema("West Bengal", "WB", "East"),
            new StateSchema("Gujarat", "GJ", "West"),
            new StateSchema("Rajasthan", "RJ", "North"),
            new StateSchema("Uttar Pradesh", "UP", "North"),
            new StateSchema("Madhya Pradesh", "MP", "Central"),
            new StateSchema("Punjab", "PB", "North"),
            new StateSchema("Haryana", "HR", "North"),
            new StateSchema("Bihar", "BR", "East"),
            new StateSchema("Kerala", "KL", "South"),
            new StateSchema("Odisha", "OD", "East"),
            new StateSchema("Assam", "AS", "Northeast"),
            new StateSchema("Jharkhand", "JH", "East"),
            new StateSchema("Chhattisgarh", "CG", "Central"),
            new StateSchema("Andhra Pradesh", "AP", "South"),
            new StateSchema("Uttarakhand", "UK", "North")
    );
}
