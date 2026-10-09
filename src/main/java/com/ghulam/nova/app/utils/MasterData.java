package com.ghulam.nova.app.utils;

import java.util.List;

public final class MasterData {

    public record StateSchema(String name, String code, String region) {
    }

    public record CitySchema(String name, Integer stateId, Integer tier, String pincode) {
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

    public static CitySchema city(String name) {
        return new CitySchema(
                name,
                CommonUtils.nextInt(1, 20),
                CommonUtils.nextInt(1, 3),
                CommonUtils.nextInt(6)
        );
    }

    public static final List<CitySchema> CITIES = List.of(
            city("Mumbai"),
            city("Pune"),
            city("Nagpur"),
            city("Nashik"),
            city("Thane"),
            city("Solapur"),
            city("Kolhapur"),
            city("Amravati"),
            city("Navi Mumbai"),
            city("New Delhi"),
            city("Bengaluru"),
            city("Hyderabad"),
            city("Chennai"),
            city("Kolkata"),
            city("Ahmedabad"),
            city("Jaipur"),
            city("Lucknow"),
            city("Kanpur"),
            city("Varanasi"),
            city("Prayagraj"),
            city("Noida"),
            city("Chandigarh"),
            city("Bhopal"),
            city("Indore"),
            city("Patna"),
            city("Ranchi"),
            city("Dehradun"),
            city("Srinagar")
    );
}
