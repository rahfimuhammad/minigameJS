const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
canvas.width = 1024
canvas.height = 576
const platformWidth = 580
const platformHeight = 125
const platformSmallTallWidth = 291
const platformSmallTallHeight = 227


let playerImagePath = './assets/spriteStandRight.png';

const gravity = 2
class Player {
    constructor({ imagePath }) {
        this.position = {
            x: 100,
            y: 100
        }
        this.velocity = {
            x: 0,
            y: 0  
        }
        this.width = 66
        this.height = 150
        this.speed = 10
        this.frames = 0
        this.imagePath = imagePath;
        this.image = new Image();
        this.image.src = this.imagePath;
        this.sprites = {
            stand: {
                cropWidth: 177,
                width: 66
            },
            run: {
                cropWidth: 341,
                width: 127.875
            }
        }
        this.currentCropWidth = this.sprites.stand.cropWidth
    }
    draw() {
        
        if(this.image.complete) {
            c.drawImage(this.image,
                        this.currentCropWidth * this.frames,
                        0,
                        this.currentCropWidth,
                        400, 
                        this.position.x, 
                        this.position.y, 
                        this.width, 
                        this.height)
        } else {
            c.fillStyle = 'transparent'
            c.fillRect(this.position.x,
                       this.position.y,
                       this.width,
                       this.height)
        }
    }
    update() {

        this.frames++
        if(this.frames > 59 && this.currentCropWidth === this.sprites.stand.cropWidth) {
            this.frames = 0
        } else if( this.frames > 29 && this.currentCropWidth === this.sprites.run.cropWidth) {
            this.frames = 0
        }
        this.draw()
        this.position.y += this.velocity.y
        this.position.x += this.velocity.x

        if(this.position.y + this.height
           + this.velocity.y <= canvas.height) {
                this.velocity.y += gravity
        }
    }
}

function changePlayerImage(newImagePath) {
    playerImagePath = newImagePath;
    player.image.src = playerImagePath;

    player.image.onload = function() {
        player.draw();
    }
}

class Platform {
    constructor({x, y, imagePath, width, height}) {
        this.position = {
            x,
            y
        }
        this.width = width
        this.height = height
        this.image = new Image();
        this.image.src = imagePath;
    }
    draw() {
        if(this.image.complete) {
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
        } else {
            c.fillStyle = 'blue'
            c.fillRect(this.position.x,
                       this.position.y,
                       this.width,
                       this.height)
        }
    }
}

class GenericObject {
    constructor({x, y, imagePath, width, height}) {
        this.position = {
            x,
            y
        }
        this.width = width
        this.height = height
        this.image = new Image();
        this.image.src = imagePath;
    }
    draw() {
        if(this.image.complete) {
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
        } else {
            c.fillStyle = 'blue'
            c.fillRect(this.position.x,
                       this.position.y,
                       this.width,
                       this.height)
        }
    }
}

let player = new Player({
    imagePath: playerImagePath
})
let platforms = []
let genericObjects = []
let scrollOffset = 0
let lastJumpTime = 0;
let jumpCount = 0;
const maxJumpCount = 3;
let isJumping = false;
const keys = {
    left: {
        pressed: false
    },
    right: {
        pressed: false
    },
    up: {
        pressed: false
    },
    down: {
        pressed: false
    }
}

function init() {

    keys.left.pressed = false
    keys.right.pressed = false
    lastJumpTime = 0;
    jumpCount = 0;
    isJumping = false;
    changePlayerImage('./assets/spriteStandRight.png');

    player = new Player({
        imagePath: playerImagePath
    })
    platforms = [
            new Platform({
            x: 0, y: canvas.height - platformHeight, width: platformWidth, height: platformHeight, imagePath: './assets/platform.png'
        }), new Platform({
            x: platformWidth, y: canvas.height - platformHeight, width: platformWidth, height: platformHeight, imagePath: './assets/platform.png'
        }), new Platform({
            x: platformWidth * 2 + 200, y: canvas.height - platformHeight, width: platformWidth, height: platformHeight, imagePath: './assets/platform.png'
        }), new Platform({
            x: platformWidth * 3 + 200, y: canvas.height - 227, width: platformSmallTallWidth, height: platformSmallTallHeight, imagePath: './assets/platformSmallTall.png'
        }), new Platform({
            x: platformWidth * 3 + platformSmallTallWidth + 350, y: canvas.height - platformHeight , width: platformWidth, height: platformHeight, imagePath: './assets/platform.png'
        })]
    genericObjects = [
            new GenericObject({
        x: -1, y: -1, width: 11643, height: 732 , imagePath: './assets/background.png'
        }), new GenericObject({
        x: -1, y: -1, width: 7545, height: 592 , imagePath: './assets/hills.png'
        })]
    scrollOffset = 0
}

function animate() {
    requestAnimationFrame(animate)
    c.fillStyle = 'white'
    c.fillRect(0, 0, canvas.width, canvas.height)
    genericObjects.forEach(genericObject => {
        genericObject.draw()
    })
    platforms.forEach(platform => {
        platform.draw()
    })
    player.update()

    if(
        keys.right.pressed &&
        player.position.x < 400
        ) {
            player.velocity.x = player.speed
    } else if(
        (keys.left.pressed && player.position.x > 100) ||
        (keys.left.pressed && scrollOffset === 0
        && player.position.x  > 0)
        ) {
            player.velocity.x = -player.speed
    } else {
        player.velocity.x = 0
        if(keys.right.pressed) {
            scrollOffset += player.speed
            platforms.forEach(platform => {
                platform.position.x -= player.speed
            })
            genericObjects.forEach(genericObject => {
                genericObject.position.x -= player.speed * .66
            })
        } else if(keys.left.pressed && scrollOffset > 0) {
            scrollOffset -= player.speed
            platforms.forEach(platform => {
                platform.position.x += player.speed
            })
            genericObjects.forEach(genericObject => {
                genericObject.position.x += player.speed * .66
            })
        }
    }

    platforms.forEach(platform => {
        if (
            player.position.x + player.width >= platform.position.x &&
            player.position.x < platform.position.x &&
            player.position.y < platform.position.y + platform.height &&
            player.position.y + player.height > platform.position.y
        ) {
            if (keys.right.pressed) {
                player.velocity.x = player.speed;
            }
            player.position.x = platform.position.x - player.width;
        }
        else if (
            player.position.x <= platform.position.x + platform.width &&
            player.position.x + player.width > platform.position.x + platform.width &&
            player.position.y < platform.position.y + platform.height &&
            player.position.y + player.height > platform.position.y
        ) {
            if (keys.left.pressed) {
                player.velocity.x = -player.speed;
            }
            player.position.x = platform.position.x + platform.width;
        }
        else if (
            player.position.y + player.height >= platform.position.y &&
            player.position.y < platform.position.y &&
            player.position.x + player.width > platform.position.x &&
            player.position.x < platform.position.x + platform.width
        ) {
            player.position.y = platform.position.y - player.height;
        }
        else if (
            player.position.y <= platform.position.y + platform.height &&
            player.position.y + player.height > platform.position.y + platform.height &&
            player.position.x + player.width > platform.position.x &&
            player.position.x < platform.position.x + platform.width
        ) {
            player.position.y = platform.position.y + platform.height;
        }
    });

    platforms.forEach(platform => {
        if (player.position.y + player.height >= platform.position.y && player.velocity.y >= 0) {
            jumpCount = 0;
        }
    })
    
    platforms.forEach(platform => {
        if(
            player.position.y + player.height <= 
                platform.position.y 
            && 
            player.position.y + player.height + 
                player.velocity.y >= 
                platform.position.y 
            && 
            player.position.x + player.width >= 
                platform.position.x 
            &&
            player.position.x <= platform.position.x 
                + platform.width
            ) {
                player.velocity.y = 0
        } 
    })

    if(scrollOffset >= 580 * 3 + 700) {
        alert('you win')
        init()
    } 

    if(player.position.y > canvas.height) {
        init()
    }
}

init()
animate()

addEventListener('keydown', ({ keyCode }) => {
    switch (keyCode) {
        case 65:
        case 37:
            keys.left.pressed = true
            changePlayerImage('./assets/spriteRunLeft.png');
            player.currentCropWidth = player.sprites.run.cropWidth
            player.width = player.sprites.run.width
            break
        case 83:
        case 40:
            break
        case 68:
        case 39:
            keys.right.pressed = true
            changePlayerImage('./assets/spriteRunRight.png');
            player.currentCropWidth = player.sprites.run.cropWidth
            player.width = player.sprites.run.width
            break
        case 87:
        case 38:
            keys.up.pressed = true
            const currentTime = Date.now();
            const timeSinceLastJump = currentTime - lastJumpTime;
            if (!isJumping && timeSinceLastJump < 1 && jumpCount < 2) {
                player.velocity.y -= 10;
                isJumping = true;
                jumpCount++;
            } else if(!isJumping && jumpCount <= 2 ) {
                player.velocity.y -= 15;
                jumpCount++
                keys.up.pressed = false
            } else if(!isJumping && jumpCount === 3 && keys.up.pressed) {
                jumpCount = 1
            }
            lastJumpTime = currentTime;
            break;
    }
})

addEventListener('keyup', ({ keyCode }) => {
    switch (keyCode) {
        case 65:
        case 37:
            keys.left.pressed = false
            changePlayerImage('./assets/spriteStandLeft.png');
            player.currentCropWidth = player.sprites.stand.cropWidth
            player.width = player.sprites.stand.width
            break
        case 83:
        case 40:
            break
        case 68:
        case 39:
            keys.right.pressed = false
            changePlayerImage('./assets/spriteStandRight.png');
            player.currentCropWidth = player.sprites.stand.cropWidth
            player.width = player.sprites.stand.width
            break
        case 87:
        case 38:
            isJumping = false;
            break
    }
})

function handleTouchStart(event) {
    event.preventDefault();
    const touchX = event.touches[0].clientX;
    const touchY = event.touches[0].clientY;

    if (touchY < window.innerHeight / 2 && touchX > window.innerWidth / 3 && touchX < window.innerWidth * (2/3) ) {
        keys.up.pressed = true;
        const currentTime = Date.now();
            const timeSinceLastJump = currentTime - lastJumpTime;
            if (!isJumping && timeSinceLastJump < 20 && jumpCount < 2) {
                player.velocity.y -= 30;
                isJumping = true;
                jumpCount++;
            } else if(!isJumping && jumpCount <= 2 ) {
                player.velocity.y -= 15;
                jumpCount++
                keys.up.pressed = false
            } else if(!isJumping && jumpCount === 3 && keys.up.pressed) {
                jumpCount = 1
            }
            lastJumpTime = currentTime;
            console.log('up')
    } else if(touchX < window.innerWidth / 2) {
        changePlayerImage('./assets/spriteRunLeft.png');
        player.currentCropWidth = player.sprites.run.cropWidth
        player.width = player.sprites.run.width
        keys.left.pressed = true;
        keys.right.pressed = false;
    } else if(touchX > window.innerWidth / 2) {
        changePlayerImage('./assets/spriteRunRight.png');
        keys.left.pressed = false;
        keys.right.pressed = true;
        player.currentCropWidth = player.sprites.run.cropWidth
        player.width = player.sprites.run.width
    }
}

function handleTouchEnd(event) {
    event.preventDefault();
    
    keys.left.pressed = false;
    keys.right.pressed = false;
    keys.up.pressed = false;
    changePlayerImage('./assets/spriteStandRight.png');
    player.currentCropWidth = player.sprites.stand.cropWidth
    player.width = player.sprites.stand.width
}

canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchend', handleTouchEnd);