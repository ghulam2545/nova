package com.ghulam.nova.app.services;

import com.ghulam.nova.app.utils.MasterData;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

import static com.ghulam.nova.helper.AppSetting.LOGGER;

public class CityGenerator implements ContentGenerator {

    private static final String TABLE_NAME = "cities";

    @Override
    public <T> T generate(Path path) {
        List<MasterData.CitySchema> cities = MasterData.CITIES;

        LOGGER(String.format("Generating content for [ %s ]...", TABLE_NAME));
        try (CsvWriter w = new CsvWriter(path, TABLE_NAME, "id", "city_name", "state_id", "tier", "pincode")) {
            for (int i = 0; i < cities.size(); i++) {
                var c = cities.get(i);
                w.writeRow(i + 1, c.name(), c.stateId(), c.tier(), c.pincode());
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        return null;
    }
}