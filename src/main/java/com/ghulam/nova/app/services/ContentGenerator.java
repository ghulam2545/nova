package com.ghulam.nova.app.services;

import java.nio.file.Path;

public interface ContentGenerator {

    <T> T generate(Path path);
}
