import {Slider} from './slider/slider'
import './slider/style.scss'

const slider = new Slider('#slider', {
    width: 600,
    slidesToShow: 3,
    slidesToScroll: 3,
    speed: 500,
    beforeChange: () => {console.log('beforeChange')},
    afterChange: () => {console.log('afterChange')},
    autoplay: true,
    autoplaySpeed: 3000,
})

window.s = slider

