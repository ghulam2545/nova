package com.ghulam.nova.helper;

import com.ghulam.nova.app.services.CityGenerator;
import com.ghulam.nova.app.services.StateGenerator;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.nio.file.Path;

import static com.ghulam.nova.helper.AppSetting.LOGGER;

@Component
public final class GeneratorApplication {

    private static final String OUT_DIR = "data";

    @EventListener(ApplicationReadyEvent.class)
    @Order(2)
    public void init() {
        LOGGER("Starting data generator application...");

        Path dir = Path.of(OUT_DIR);
        new StateGenerator().generate(dir);
        new CityGenerator().generate(dir);

        LOGGER(String.format("All CSV files written to [ %s ] directory.", OUT_DIR));
    }
}
