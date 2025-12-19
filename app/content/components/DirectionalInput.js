class DirectionalInput {
    constructor(rateLimitMillis = 200) {
        this.onDirection = () => {};
        this.timeouts = {};
        this.directions = {};
        this.rateLimitMillis = rateLimitMillis;

        window.addEventListener('keydown', this._handleKeyDown.bind(this));
    }

    addGamepad(gamepad) {
        // D-pad
        gamepad.addEventListener('buttonpress', e => this._handleDpadPress(e.index), StandardMapping.Button.D_PAD_UP);
        gamepad.addEventListener('buttonpress', e => this._handleDpadPress(e.index), StandardMapping.Button.D_PAD_DOWN);
        gamepad.addEventListener('buttonpress', e => this._handleDpadPress(e.index), StandardMapping.Button.D_PAD_LEFT);
        gamepad.addEventListener('buttonpress', e => this._handleDpadPress(e.index), StandardMapping.Button.D_PAD_RIGHT);

        // Joystick
        gamepad.addEventListener('joystickmove', e => {
            this._checkJoystickDirection(e.gamepad, e.horizontalIndex, e.horizontalValue, DIRECTION.RIGHT, DIRECTION.LEFT);
            this._checkJoystickDirection(e.gamepad, e.verticalIndex, e.verticalValue, DIRECTION.DOWN, DIRECTION.UP);
        }, StandardMapping.Axis.JOYSTICK_LEFT);
    }

    _handleKeyDown(e) {
        let direction = -1;
        switch (e.key) {
            case 'ArrowUp':
                direction = DIRECTION.UP;
                break;
            case 'ArrowDown':
                direction = DIRECTION.DOWN;
                break;
            case 'ArrowLeft':
                direction = DIRECTION.LEFT;
                break;
            case 'ArrowRight':
                direction = DIRECTION.RIGHT;
                break;
        }

        if (direction !== -1) {
            this.onDirection(direction);
        }
    }

    _handleDpadPress(index) {
        let direction = -1;
        switch (index) {
            case StandardMapping.Button.D_PAD_UP:
                direction = DIRECTION.UP;
                break;
            case StandardMapping.Button.D_PAD_DOWN:
                direction = DIRECTION.DOWN;
                break;
            case StandardMapping.Button.D_PAD_LEFT:
                direction = DIRECTION.LEFT;
                break;
            case StandardMapping.Button.D_PAD_RIGHT:
                direction = DIRECTION.RIGHT;
                break;
        }

        if (direction !== -1) {
            this.onDirection(direction);
        }
    }

    _checkJoystickDirection(gamepad, axis, value, pos, neg) {
        if (Math.abs(value) >= 1 - gamepad.joystickDeadzone) {
            let direction = value > 0 ? pos : neg;
            if (!(axis in this.directions) || this.directions[axis] !== direction) {
                this.directions[axis] = direction;
                this._rateLimitJoystickDirection(axis);
            }
        } else {
            this.directions[axis] = -1;
            if (axis in this.timeouts) {
                clearTimeout(this.timeouts[axis]);
                delete this.timeouts[axis];
            }
        }
    }

    _rateLimitJoystickDirection(axis) {
        if (this.directions[axis] !== -1) {
            this.onDirection(this.directions[axis]);
            this.timeouts[axis] = setTimeout(() => this._rateLimitJoystickDirection(axis), this.rateLimitMillis);
        }
    }
}
