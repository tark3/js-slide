export class Slider {

    constructor(selector, options) {

        this.$el = document.querySelector(selector)
        this.options = {
            width: options.width || 700,
            infinite: options.infinite || false,
            slidesToShow: options.slidesToShow || 1,
            slidesToScroll: options.slidesToScroll || 1,
            autoplay: options.autoplay || false,
            pauseOnHover: options.pauseOnHover || true,
            speed: options.speed || 0,
            autoplaySpeed: options.autoplaySpeed || 3000,
            beforeChange: options.beforeChange || null,
            afterChange: options.afterChange || null,
        }
        this.current = this.options.current || 0

        this.#render()
    }

    #render() {
        this.$el.classList.add('slider')

        const contentHtml = this.$el.innerHTML
        this.$el.innerHTML = ''

        const slideNodes = this.#htmlToDivElementArray(contentHtml)

        this.oneSlideWidth = this.options.width / this.options.slidesToShow
        this.slidesCount = slideNodes.length

        // add common class to slider items
        for (let node of slideNodes) {
            node.classList.add('slider__item')
            node.style.width = this.oneSlideWidth + 'px'
            node.style.background = this.#getRandomColor()
        }

        // take first/last slides for cloning
        const firstSlideNodes = slideNodes.slice(0, this.options.slidesToShow)
        const lastSlideNodes = slideNodes.slice(slideNodes.length - this.options.slidesToShow, slideNodes.length)

        // create element which will contain slides
        const nodeSliderList = document.createElement("div")
        nodeSliderList.classList.add('slider__list')

        //clone last elements, set corresponding class and add them to list
        for (let [i, node] of lastSlideNodes.entries()) {
            const clonedNode = node.cloneNode(true)
            clonedNode.classList.add('slider__item_cloned-last')
            clonedNode.setAttribute('slide-index', -(this.options.slidesToShow - i))
            nodeSliderList.appendChild(clonedNode)
        }

        //add slides to list
        for (let [i, node] of slideNodes.entries()) {
            node.setAttribute('slide-index', i)
            nodeSliderList.appendChild(node)
        }

        //clone first elements, set corresponding class and add them to list
        for (let [i, node] of firstSlideNodes.entries()) {
            const clonedNode = node.cloneNode(true)
            clonedNode.classList.add('slider__item_cloned-first')
            clonedNode.setAttribute('slide-index', (this.slidesCount + i))
            nodeSliderList.appendChild(clonedNode)
        }

        // create elements for buttons
        const nodeLeftButton = document.createElement("button")
        nodeLeftButton.classList.add('slider__button-prev')
        const nodeRightButton = document.createElement("button")
        nodeRightButton.classList.add('slider__button-next')

        // create element to display visible slides
        const nodeSliderWindow = document.createElement("div")
        nodeSliderWindow.classList.add('slider__window')
        nodeSliderWindow.addEventListener('mouseover', this.#slideWindowOverEvent)
        nodeSliderWindow.addEventListener('mouseout', this.#slideWindowOutEvent)

        // create dot list element
        const nodeDotsUl = document.createElement("ul")
        nodeDotsUl.classList.add('slider__dot-list')

        for (let i = 0; i < this.slidesCount; i++) {
            if (i % this.options.slidesToShow === 0 || i === 0) {
                const nodeDotLi = document.createElement("li")
                nodeDotLi.classList.add('slider__dot-element')
                const nodeDotButton = document.createElement("button")
                nodeDotButton.dataset.slide = i
                nodeDotButton.classList.add('slider__dot-button')
                nodeDotButton.addEventListener('click', () => {
                    this.#dotButtonClickEvent(i)
                })
                nodeDotButton.innerHTML = i
                nodeDotLi.appendChild(nodeDotButton)
                nodeDotsUl.appendChild(nodeDotLi)

            }
        }

        // add slider list element and buttons to visible slides element
        nodeSliderWindow.append(nodeLeftButton, nodeSliderList, nodeRightButton, nodeDotsUl)

        // add visible slides element to mails slider element
        this.$el.appendChild(nodeSliderWindow)

        // create selectors
        this.$elSliderList = document.querySelector('.slider__list')
        this.$elButtonPrev = document.querySelector('.slider__button-prev')
        this.$elButtonNext = document.querySelector('.slider__button-next')

        this.$elSliderList.style.transition = 'all ' + this.options.speed + 'ms linear'
        this.$elSliderList.addEventListener('transitionstart', this.#transitionStartEvent);
        this.$elSliderList.addEventListener('transitionend', this.#transitionEndEvent);

        const $sliderElements = this.$elSliderList.children

        // set slide list block with using width from options and slide count
        this.slidesWithClonedCount = $sliderElements.length
        this.$el.style.width = this.options.width + 'px'
        this.$elSliderList.style.width = this.options.width / this.options.slidesToShow * this.slidesWithClonedCount + 'px'

        // add events
        this.$elButtonPrev.addEventListener('click', this.#prevClickEvent)
        this.$elButtonNext.addEventListener('click', this.#nextClickEvent)

        // display first not cloned slide
        this.current = this.options.slidesToShow
        this.#displayCurrentSlide()
        this.#setActiveDot(0)

        // start auto play if it is enabled
        if (this.options.autoplay === true) this.play()

    }

    // go to previous slide
    prev = () => {
        console.log('prev')

        if (this.current === 0) {
            this.current = 0
        } else {
            this.current = this.current - this.options.slidesToScroll
        }

        this.#displayCurrentSlide()
        this.#setDotFromNextOrPrev()
    }

    // go to next slide
    next = () => {
        console.log('next')

        if (this.current === this.slidesWithClonedCount - this.options.slidesToScroll) {
            this.current = 0
        } else {
            this.current = this.current + this.options.slidesToScroll
        }

        console.log('Current slide is: ' + (this.current - this.options.slidesToShow))
        this.#displayCurrentSlide()
        this.#setDotFromNextOrPrev()
    }

    // getter for current slide number
    get currentSlide() {
        return this.current - this.options.slidesToShow
    }

    // set active slider by number, first value is 0
    goTo(slide) {
        console.log(this.current, slide)
        this.current = slide + this.options.slidesToScroll
        this.#displayCurrentSlide()
    }

    // start sliding from current slide
    play() {
        console.log('play')

        this.timer = setInterval(this.next, this.options.autoplaySpeed);
    }

    // stop sliding
    pause() {
        console.log('paused')

        if (this.timer !== undefined) clearInterval(this.timer)
    }

    #slideWindowOverEvent = () => {
        console.log('mouseover')
        if (this.options.autoplay) this.pause()
    }

    #slideWindowOutEvent = () => {
        console.log('mouseout')
        if (this.options.autoplay) this.play()
    }

    #nextClickEvent = () => {
        console.log('Next click')

        this.next(false)

        // pause sliding if next was clicked
        if (this.options.autoplay) this.options.autoplay = false
    }

    #prevClickEvent = () => {
        console.log('Prev click')
        this.prev()
        // pause auto sliding if next was clicked
        if (this.options.autoplay) this.options.autoplay = false
    }

    #displayCurrentSlide() {
        const shift = (this.oneSlideWidth) * (this.current)
        console.log(shift, this.oneSlideWidth, this.options.slidesToScroll, this.current)
        this.$elSliderList.style.transform = 'translate3d(-' + shift + 'px, 0px, 0px)'
    }

    #transitionStartEvent = () => {
        console.log('transitionStartEvent')

        this.options.beforeChange()
    }

    #transitionEndEvent = () => {
        console.log('transitionEndEvent')

        this.options.afterChange()

        if (this.current === 0) {
            this.current = this.slidesCount
            this.$elSliderList.classList.add('slider__list_transition_disabled')
            this.#displayCurrentSlide()
            this.$elSliderList.offsetHeight
            this.$elSliderList.classList.remove('slider__list_transition_disabled')
        }

        console.log('transition ended')

        if (this.current === this.slidesCount + this.options.slidesToShow) {
            this.current = this.options.slidesToShow
            this.$elSliderList.classList.add('slider__list_transition_disabled')
            this.#displayCurrentSlide()
            this.$elSliderList.offsetHeight
            this.$elSliderList.classList.remove('slider__list_transition_disabled')

            console.log('switch from last cloned to first')
        }
    }

    #dotButtonClickEvent = (slide) => {
        console.log('dotButtonClickEvent', slide)

        this.pause()

        this.current = this.options.slidesToShow + slide
        this.#displayCurrentSlide()
        this.#setActiveDot(slide)
    }

    #setActiveDot = (slide) => {
        console.log('setActiveDot to: ', slide)

        const dotActiveButton = document.querySelector('button[data-slide = "' + slide + '"]')
        const dotButtons = document.querySelectorAll('button[data-slide]')
        for (let dot of dotButtons) {
            dot.classList.remove('slider__dot-button_active')
        }

        dotActiveButton.classList.add('slider__dot-button_active')
    }

    #setDotFromNextOrPrev = () => {
        console.log(this.current, '-', this.slidesCount + this.options.slidesToShow)

        if (((this.current - this.options.slidesToShow) % this.options.slidesToShow === 0
                //|| this.current === this.options.slidesToShow
            )
            && this.current <= this.slidesCount + this.options.slidesToShow) {

            const dotIndex = (
                this.current - this.options.slidesToShow <= 0
                || this.current + this.options.slidesToShow >= this.slidesWithClonedCount
            )
                ? 0 : this.current - this.options.slidesToShow
            this.#setActiveDot(dotIndex)
        }
    }

    #getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    #htmlToDivElementArray = html => {
        const template = document.createElement('template');
        template.innerHTML = html
        // return array only of DIV elements from template
        return [...template.content.childNodes].filter(element => element.nodeName === 'DIV')
    }
}
