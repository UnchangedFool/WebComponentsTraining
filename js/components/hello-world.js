export class HelloWorld extends HTMLHeadingElement {
    constructor() {
        super();
    }

    connectedCallback() {
        console.log(`Custom element added to page: ${this.textContent}!`);
        this.textContent = `Hello, ${this.textContent}!`;
    }

    disconnectedCallback() {
        console.log("Custom element removed from page: Bye, World! :(");
    }

    adoptedCallback() {
        console.log("custom element moved to new page: Traveling the World! :)");
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(`Attribute ${name} has changed from ${oldValue} to ${newValue}!`)
    }
}

//customElements.define("hello-world", HelloWorld, {extends: "h1"});

