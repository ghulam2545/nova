package com.ghulam.nova.app.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "states")
public class State {

    @Id
    @Column(nullable = false, updatable = false)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String stateName;

    @Column(nullable = false, length = 4)
    private String stateCode;

    @Column(nullable = false, length = 50)
    private String region;
}