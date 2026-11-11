package com.superflex.app;

public class Task implements Runnable {
    MainActivity owner;
    int kind;

    Task(MainActivity owner, int kind) {
        this.owner = owner;
        this.kind = kind;
    }

    public void run() {
        owner.perform(kind);
    }
}
