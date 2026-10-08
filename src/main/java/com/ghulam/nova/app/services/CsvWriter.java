package com.ghulam.nova.app.services;

import java.io.BufferedWriter;
import java.io.Closeable;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

public class CsvWriter implements Closeable {

    private final BufferedWriter writer;
    private final StringBuilder sb = new StringBuilder(256);
    private long rowsWritten = 0;

    public CsvWriter(Path path, String tableName, String... header) throws IOException {
        Files.createDirectories(path);
        Path filename = path.resolve(tableName + ".csv");
        // 1MB buffer: fewer syscalls
        this.writer = Files.newBufferedWriter(filename, StandardCharsets.UTF_8);
        writeRawRow((Object[]) header);
    }

    public long rowsWritten() {
        return rowsWritten;
    }

    public void writeRow(Object... values) throws IOException {
        writeRawRow(values);
        rowsWritten++;
    }

    private void writeRawRow(Object[] values) throws IOException {
        sb.setLength(0);
        for (int i = 0; i < values.length; i++) {
            if (i > 0) sb.append(',');
            appendField(sb, values[i]);
        }
        sb.append('\n');
        writer.write(sb.toString());
    }

    private static void appendField(StringBuilder sb, Object value) {
        if (value == null) return;
        String s = (value instanceof Double d) ? formatDouble(d) : String.valueOf(value);
        boolean needsQuote = s.indexOf(',') >= 0 || s.indexOf('"') >= 0
                || s.indexOf('\n') >= 0 || s.indexOf('\r') >= 0;
        if (needsQuote) {
            sb.append('"');
            for (int i = 0; i < s.length(); i++) {
                char c = s.charAt(i);
                if (c == '"') sb.append('"'); // double up embedded quotes
                sb.append(c);
            }
            sb.append('"');
        } else {
            sb.append(s);
        }
    }

    /**
     * Double.toString() switches to scientific notation ("1.0E7") at 10,000,000
     * and above — which is exactly the RTGS/loan-principal clip ceiling in this
     * dataset. BigDecimal.toPlainString() never does, so every numeric column
     * round-trips cleanly through COPY regardless of magnitude.
     */
    private static String formatDouble(double d) {
        return java.math.BigDecimal.valueOf(d)
                .setScale(2, java.math.RoundingMode.HALF_UP)
                .toPlainString();
    }

    @Override
    public void close() throws IOException {
        writer.close();
    }
}
