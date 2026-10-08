package com.ghulam.nova.app.services;

import com.ghulam.nova.app.utils.MasterData;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

public class StateGenerator implements ContentGenerator {

    @Override
    public <T> T generate(Path path) {
        List<MasterData.StateSchema> states = MasterData.STATES;

        try (CsvWriter w = new CsvWriter(path, "states", "id", "state_name", "state_code", "region")) {
            for (int i = 0; i < states.size(); i++) {
                var s = states.get(i);
                w.writeRow(i + 1, s.name(), s.code(), s.region());
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        return null;
    }
}