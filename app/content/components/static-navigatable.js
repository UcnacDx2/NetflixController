class StaticNavigatable extends Navigatable {
    constructor() {
        super();
        this.position = -1;
    }

    get components() {
        if (!this._components) {
            this._components = this.getComponents();
        }
        return this._components;
    }

    getComponents() {
        throw new TypeError('must implement abstract StaticNavigatable#getComponents');
    }

    getSelectedComponent() {
        return this.components[this.position];
    }

    // can be overriden for custom style component
    getStyleComponent() {
        return this.getSelectedComponent();
    }

    // can be overriden for custom interaction component
    getInteractionComponent() {
        return this.getSelectedComponent();
    }

    // can be overriden for custom interaction
    interact(component) {
        component.click();
    }

    // can be overriden for custom styling, such as with pseudo-styler
    style(component, selected) {

    }

    // can be overriden to disable scrolling into view when selected
    shouldScrollIntoView() {
        return true;
    }

    left() {
        if (this.position > 0) {
            this.select(this.position - 1);
        }
    }

    right() {
        if (this.position < this.components.length - 1) {
            this.select(this.position + 1);
        }
    }

    up() {
        this._navigateVertical((r1, r2) => r1.bottom < r2.top, candidates => Math.max(...candidates.map(c => c.rect.bottom)));
    }

    down() {
        this._navigateVertical((r1, r2) => r1.top > r2.bottom, candidates => Math.min(...candidates.map(c => c.rect.top)));
    }

    _navigateVertical(predicate, extrema) {
        if (this.position === -1) {
            return;
        }

        const currentComponent = this.getSelectedComponent();
        const currentRect = currentComponent.getBoundingClientRect();
        let candidates = [];

        this.components.forEach((component, index) => {
            if (index !== this.position) {
                const rect = component.getBoundingClientRect();
                if (predicate(rect, currentRect)) {
                    candidates.push({ component, rect, index });
                }
            }
        });

        if (candidates.length > 0) {
            const extremeValue = extrema(candidates);
            const rowComponents = candidates.filter(c => (predicate(c.rect, currentRect) ? c.rect.bottom : c.rect.top) === extremeValue);

            const currentCenterX = currentRect.left + currentRect.width / 2;
            let closest = rowComponents[0];
            let minDistance = Math.abs((closest.rect.left + closest.rect.width / 2) - currentCenterX);

            for (let i = 1; i < rowComponents.length; i++) {
                const candidate = rowComponents[i];
                const distance = Math.abs((candidate.rect.left + candidate.rect.width / 2) - currentCenterX);
                if (distance < minDistance) {
                    minDistance = distance;
                    closest = candidate;
                }
            }
            this.select(closest.index);
        }
    }

    enter(params) {
        this.select(0);
    }

    exit() {
        this.unselect();
        this.position = -1;
    }

    getActions() {
        return [
            {
                label: 'Select',
                index: StandardMapping.Button.BUTTON_BOTTOM,
                onPress: () => this.interact(this.getInteractionComponent())
            }
        ];
    }

    unselect() {
        if (this.position >= 0) {
            let component = this.getStyleComponent();
            this.style(component, false);
            component.style.outline = '0';
        }
    }

    select(position) {
        this.unselect();
        this.position = position;
        let component = this.getStyleComponent();
        this.style(component, true);
        component.style.outline = '3px solid ' + getTransparentNetflixRed(0.7);
        if (this.shouldScrollIntoView()) {
            Navigatable.scrollIntoView(this.getStyleComponent());
        }
    }
}