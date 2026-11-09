package com.superflex.app;

public class Task implements Runnable {
    final MainActivity owner;
    final int kind;

    public Task(MainActivity owner, int kind) {
        this.owner = owner;
        this.kind = kind;
    }

    @Override
    public void run() {
        owner.perform();
    }
}
