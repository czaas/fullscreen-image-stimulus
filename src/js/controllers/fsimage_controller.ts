import { Controller } from "stimulus";

export default class FullScreenImageController extends Controller {
	// targets data
	static targets = ["image"];
	imageTarget!: HTMLImageElement;

	// state
	isFullScreen: Boolean = false;

	// settings
	transitionTimeMs = 0;
	easing = "cubic-bezier(0.4, 0.0, 0.2, 1)";
	easingIn = "cubic-bezier(0.4, 0.0, 0.2, 1)";
	timeout;

	// elements
	animatedContainer?: HTMLDivElement;
	veil?: HTMLDivElement;
	clonedImage?: HTMLDivElement;

	connect() {
		// a11y check for reduced motion
		const useMotion = window.matchMedia("(prefers-reduced-motion: no-preference)");
		if (useMotion?.matches) {
			this.transitionTimeMs = 200;
		}
	}

	toggleFullScreen() {
		this.isFullScreen ? this.removeFullScreenImage() : this.makeImageFullScreen();
	}

	makeImageFullScreen() {
		// set state
		this.isFullScreen = true;

		// create full screen elements
		const veil = document.createElement("div") as HTMLDivElement;
		const animatedContainer = document.createElement("div") as HTMLDivElement;
		const clonedImage = document.createElement("img") as HTMLImageElement;

		// clone image attributes
		clonedImage.src = this.imageTarget.src;
		clonedImage.alt = this.imageTarget.alt;

		// save elements to state
		this.clonedImage = clonedImage;
		this.veil = veil;
		this.animatedContainer = animatedContainer;

		// attach children to elements
		animatedContainer.appendChild(clonedImage);
		veil.appendChild(animatedContainer);
		document.body.appendChild(veil);

		// setup listeners when to close element
		veil.addEventListener("click", () => this.removeFullScreenImage());
		document.addEventListener("keydown", this.handleKeyDown());

		// first set initial style
		this.initialStyle();

		// then animate it
		this.animateFullScreen();
	}
	handleKeyDown() {
		return (e) => {
			if (e.key === "Escape") {
				this.removeFullScreenImage();
				document.removeEventListener("keydown", this.handleKeyDown);
			}
		};
	}
	removeFullScreenImage() {
		// revert styles back to initial styles
		this.initialStyle();
		this.isFullScreen = false;

		// after the animation completes, remove the element from the DOM
		setTimeout(() => {
			// remove scroll lock
			document.body.style["overflow"] = "initial";
			this.veil.remove();
		}, this.transitionTimeMs);
	}
	initialStyle() {
		// clear animation timeout if full screen was canceled
		clearTimeout(this.timeout);

		// get position and dimensions of current image
		const { width, height, top, left } = this.imageTarget.getBoundingClientRect();

		// add scroll lock
		document.body.style["overflow"] = "hidden";

		this.clonedImage.style["width"] = "100%";
		this.clonedImage.style["height"] = "100%";
		this.clonedImage.style["object-fit"] = "contain";

		this.imageTarget.style["opacity"] = "1";

		this.veil.style["background"] = `rgba(0,0,0,0)`;
		this.veil.style["width"] = `100vw`;
		this.veil.style["height"] = `100vh`;
		this.veil.style["position"] = `fixed`;
		this.veil.style["top"] = `0`;
		this.veil.style["left"] = `0`;
		this.veil.style["transition"] = `all ${this.transitionTimeMs}ms ${this.easingIn}`;

		this.animatedContainer.style["position"] = `fixed`;
		this.animatedContainer.style["transition"] = `all ${this.transitionTimeMs}ms ${this.easing}`;
		this.animatedContainer.style["width"] = `${width}px`;
		this.animatedContainer.style["height"] = `${height}px`;
		this.animatedContainer.style["top"] = `${top}px`;
		this.animatedContainer.style["left"] = `${left}px`;
		this.animatedContainer.style["overflow"] = `hidden`;
		this.animatedContainer.style["background"] = `rgba(0,0,0,0)`;
		this.animatedContainer.style["display"] = `flex`;
		this.animatedContainer.style["justify-content"] = `center`;
		this.animatedContainer.style["align-items"] = `center`;
	}
	animateFullScreen() {
		this.veil.style["transition"] = `all ${this.transitionTimeMs}ms ${this.easing}`;
		this.imageTarget.style["transition"] = `opacity ${this.transitionTimeMs}ms ${this.easing}`;

		// animate element
		this.timeout = setTimeout(() => {
			this.animatedContainer.style["width"] = `100vw`;
			this.animatedContainer.style["height"] = `100vh`;
			this.animatedContainer.style["top"] = `0`;
			this.animatedContainer.style["left"] = `0`;
			this.imageTarget.style["opacity"] = ".1";
			this.veil.style["background"] = `rgba(0,0,0,.9)`;
		}, this.transitionTimeMs);
	}
}
