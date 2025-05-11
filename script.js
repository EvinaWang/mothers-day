// 获取画布和上下文
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 设置画布尺寸为窗口大小
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 监听窗口大小变化，调整画布尺寸
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// 颜色配置
const colors = {
    fireworks: ['#ff8c69', '#ff6b6b', '#ffb6c1', '#ffc0cb', '#dda0dd', '#ee82ee', '#da70d6'],
    flowers: ['#ffb6c1', '#ffc0cb', '#dda0dd', '#ee82ee', '#da70d6'] // 浅粉色和浅紫色
};

// ===== 星星特效 =====
class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        // 星星位于极光下方，占画面的四分之一
        this.y = canvas.height * 0.25 + Math.random() * canvas.height * 0.25;
        this.size = Math.random() * 2 + 1;
        this.blinkSpeed = Math.random() * 0.05 + 0.01;
        this.alpha = Math.random();
        this.alphaChange = this.blinkSpeed;
        // 将星星分为三组，每组闪烁频率不同
        this.group = Math.floor(Math.random() * 3); // 0, 1, 2 三组
        this.blinkOffset = this.group * (Math.PI * 2 / 3); // 三组之间的相位差
    }

    // 星星闪烁效果已在update方法中重新实现

    update() {
        // 基于时间和组别计算闪烁效果
        const time = Date.now() * 0.001; // 当前时间（秒）
        // 根据组别计算不同的闪烁周期
        this.alpha = 0.3 + 0.7 * Math.sin(time * this.blinkSpeed + this.blinkOffset);
    }

    draw() {
        // 绘制五角星
        const spikes = 5; // 五角星的尖角数
        const outerRadius = this.size * 2;
        const innerRadius = this.size * 0.8;
        
        ctx.beginPath();
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.PI / 2); // 旋转使一个尖角朝上
        
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (Math.PI * i) / spikes;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.fill();
        ctx.restore();
    }
}

// ===== 鲜花特效 =====
class Flower {
    constructor() {
        this.x = Math.random() * canvas.width;
        // 鲜花位于最底部四分之一区域
        this.y = canvas.height * 0.75 + Math.random() * canvas.height * 0.25;
        this.size = Math.random() * 5 + 3;
        this.color = colors.flowers[Math.floor(Math.random() * colors.flowers.length)];
        this.alpha = Math.random() * 0.5 + 0.5;
        this.petalCount = Math.floor(Math.random() * 3) + 5; // 花瓣数量
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);

        // 绘制花朵
        if (Math.random() > 0.5) {
            // 康乃馨风格
            this.drawCarnation();
        } else {
            // 玫瑰风格
            this.drawRose();
        }

        ctx.restore();
    }

    drawCarnation() {
        const petalLength = this.size * 1.5;
        
        // 绘制花瓣
        ctx.fillStyle = this.color;
        for (let i = 0; i < this.petalCount; i++) {
            ctx.save();
            ctx.rotate(i * (Math.PI * 2) / this.petalCount);
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(petalLength/2, -petalLength/4, petalLength, 0);
            ctx.quadraticCurveTo(petalLength/2, petalLength/4, 0, 0);
            ctx.fill();
            
            ctx.restore();
        }
        
        // 花蕊
        ctx.fillStyle = '#fffacd';
        ctx.beginPath();
        ctx.arc(0, 0, this.size/3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawRose() {
        // 绘制花瓣
        ctx.fillStyle = this.color;
        for (let i = 0; i < this.petalCount; i++) {
            ctx.save();
            ctx.rotate(i * (Math.PI * 2) / this.petalCount);
            
            ctx.beginPath();
            ctx.ellipse(this.size/2, 0, this.size, this.size/2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
        
        // 花蕊
        ctx.fillStyle = '#fffacd';
        ctx.beginPath();
        ctx.arc(0, 0, this.size/2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ===== 烟花特效 =====
class Firework {
    constructor(x, y, targetX, targetY, isText = false) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.isText = isText;
        this.speed = 2;
        this.angle = Math.atan2(targetY - y, targetX - x);
        this.velocity = {
            x: Math.cos(this.angle) * this.speed,
            y: Math.sin(this.angle) * this.speed
        };
        this.brightness = Math.random() * 50 + 50;
        this.color = colors.fireworks[Math.floor(Math.random() * colors.fireworks.length)];
        this.trail = [];
        this.trailLength = 10;
        this.exploded = false;
        this.particles = [];
    }

    update() {
        if (!this.exploded) {
            // 更新烟花位置
            this.x += this.velocity.x;
            this.y += this.velocity.y;

            // 保存轨迹
            this.trail.push([this.x, this.y]);
            if (this.trail.length > this.trailLength) {
                this.trail.shift();
            }

            // 检查是否到达目标位置
            const distanceToTarget = Math.hypot(this.targetX - this.x, this.targetY - this.y);
            if (distanceToTarget < 5) {
                this.explode();
            }
        } else {
            // 更新粒子
            for (let i = this.particles.length - 1; i >= 0; i--) {
                this.particles[i].update();
                if (this.particles[i].alpha <= 0) {
                    this.particles.splice(i, 1);
                }
            }
        }
    }

    draw() {
        if (!this.exploded) {
            // 绘制烟花轨迹
            ctx.beginPath();
            ctx.moveTo(this.trail[0][0], this.trail[0][1]);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i][0], this.trail[i][1]);
            }
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.stroke();

            // 绘制烟花头部
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        } else {
            // 绘制爆炸粒子
            for (const particle of this.particles) {
                particle.draw();
            }
        }
    }

    explode() {
        this.exploded = true;

        if (this.isText) {
            // 文字烟花
            this.createTextParticles();
        } else {
            // 普通烟花
            const particleCount = 100;
            for (let i = 0; i < particleCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 36 + 6;
                const particle = new Particle(
                    this.targetX,
                    this.targetY,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    this.color
                );
                this.particles.push(particle);
            }
        }
    }

    createTextParticles() {
        const text = document.getElementById('text-input').value || '母亲节快乐';
        const fontSize = 30;
        
        // 先设置主画布的字体以正确测量文字宽度
        ctx.font = `${fontSize}px Arial`;
        const textWidth = ctx.measureText(text).width;
        
        // 创建临时画布来绘制文字
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = textWidth + 20;
        tempCanvas.height = fontSize * 2;
        
        // 设置临时画布的字体样式
        tempCtx.font = `${fontSize}px Arial`;
        tempCtx.fillStyle = 'white';
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        
        // 清除临时画布背景
        tempCtx.fillStyle = 'rgba(0, 0, 0, 0)';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // 绘制文字
        tempCtx.fillStyle = 'white';
        tempCtx.fillText(text, tempCanvas.width / 2, tempCanvas.height / 2);
        
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;
        
        // 根据文字像素创建粒子
        for (let y = 0; y < tempCanvas.height; y += 2) {
            for (let x = 0; x < tempCanvas.width; x += 2) {
                const index = (y * tempCanvas.width + x) * 4;
                if (data[index + 3] > 128) { // 如果像素不透明
                    const particleX = this.targetX - textWidth / 2 + x;
                    const particleY = this.targetY - fontSize / 2 + y;
                    
                    // 雨滴型扩散效果
                    const angle = Math.atan2(particleY - this.targetY, particleX - this.targetX);
                    const distance = Math.hypot(particleX - this.targetX, particleY - this.targetY);
                    const speed = distance * 0.06 + 0.7;
                    
                    // 添加雨滴效果 - 垂直方向速度稍快
                    const velocityX = Math.cos(angle) * speed * 0.8;
                    const velocityY = Math.sin(angle) * speed * 1.2;
                    
                    const particle = new Particle(
                        this.targetX,
                        this.targetY,
                        velocityX,
                        velocityY,
                        this.color,
                        true,
                        particleX,
                        particleY
                    );
                    this.particles.push(particle);
                }
            }
        }
    }
}

class Particle {
    constructor(x, y, velocityX, velocityY, color, isText = false, targetX = null, targetY = null) {
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.gravity = 0.05;
        this.friction = 0.99;
        this.color = color;
        this.alpha = 1;
        // 调整decay值使粒子停留时间为2.2秒 (1/decay ≈ 2.2秒)
        this.decay = isText ? 1 / 2.2 : 1 / 1.21; // 文字烟花显示2.2秒，普通烟花1.21秒
        this.size = Math.random() * 3 + 1;
        
        // 文字粒子特殊属性
        this.isText = isText;
        this.targetX = targetX;
        this.targetY = targetY;
        this.arrived = false;
    }

    update() {
        if (this.isText && !this.arrived) {
            // 文字粒子向目标位置移动
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.hypot(dx, dy);
            
            if (distance < 0.5) {
                this.arrived = true;
                this.velocityX = 0;
                this.velocityY = 0;
            } else {
                this.velocityX = dx * 0.1;
                this.velocityY = dy * 0.1;
            }
        } else {
            // 普通粒子受重力影响
            this.velocityY += this.gravity;
        }
        
        // 更新位置
        this.velocityX *= this.friction;
        this.velocityY *= this.friction;
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // 粒子逐渐消失
        if (this.arrived) {
            this.alpha -= this.decay * 0.5; // 文字粒子消失得更慢
        } else {
            this.alpha -= this.decay;
        }
    }

    draw() {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// 初始化对象
const stars = [];
const flowers = [];
const fireworks = [];

// 创建星星
for (let i = 0; i < 200; i++) {
    stars.push(new Star());
}

// 创建鲜花
for (let i = 0; i < 100; i++) {
    flowers.push(new Flower());
}

// 监听点击事件，在点击位置创建烟花
canvas.addEventListener('click', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    
    // 从底部发射烟花到点击位置
    const firework = new Firework(
        Math.random() * canvas.width,
        canvas.height,
        x,
        y
    );
    fireworks.push(firework);
});

// 监听发射文字烟花按钮
document.getElementById('launch-btn').addEventListener('click', (e) => {
    // 使用鼠标当前位置作为文字烟花的目标位置
    const x = e.clientX || canvas.width / 2;
    const y = e.clientY || canvas.height / 2 - 50;
    
    // 从底部发射文字烟花到鼠标点击位置
    const firework = new Firework(
        Math.random() * canvas.width,
        canvas.height,
        x,
        y,
        true
    );
    fireworks.push(firework);
});

// 随机发射烟花
function launchRandomFirework() {
    if (Math.random() < 0.03) { // 控制发射频率
        const targetX = Math.random() * canvas.width;
        const targetY = Math.random() * (canvas.height * 0.6);
        
        const firework = new Firework(
            Math.random() * canvas.width,
            canvas.height,
            targetX,
            targetY
        );
        fireworks.push(firework);
    }
}

// 动画循环
function animate() {
    // 清除画布
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // 减小透明度以保留更多轨迹
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制极光背景
    drawAurora();
    
    // 更新和绘制星星
    for (const star of stars) {
        star.update();
        star.draw();
    }
    
    // 绘制鲜花
    for (const flower of flowers) {
        flower.draw();
    }
    
    // 更新和绘制烟花
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].draw();
        
        // 如果烟花爆炸且所有粒子都消失，则移除烟花
        if (fireworks[i].exploded && fireworks[i].particles.length === 0) {
            fireworks.splice(i, 1);
        }
    }
    
    // 随机发射烟花
    launchRandomFirework();
    
    // 继续动画循环
    requestAnimationFrame(animate);
}

// 绘制极光效果
function drawAurora() {
    // 极光位于最上方四分之一区域
    const auroraHeight = canvas.height * 0.25;
    const gradient = ctx.createLinearGradient(0, 0, 0, auroraHeight);
    
    // 极光颜色渐变 - 增加不透明度使极光更明显
    gradient.addColorStop(0, 'rgba(0, 10, 30, 0.6)');
    gradient.addColorStop(0.3, 'rgba(10, 120, 100, 0.5)');
    gradient.addColorStop(0.5, 'rgba(40, 80, 180, 0.5)');
    gradient.addColorStop(0.7, 'rgba(80, 60, 150, 0.5)');
    gradient.addColorStop(0.9, 'rgba(40, 10, 80, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 10, 40, 0.3)');
    
    // 只填充上方区域
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, auroraHeight);
    
    // 绘制极光波浪
    const time = Date.now() * 0.0002;
    const waveCount = 3; // 减少波浪数量使极光更窄
    
    for (let i = 0; i < waveCount; i++) {
        ctx.beginPath();
        ctx.moveTo(0, auroraHeight * 0.8);
        
        // 波浪曲线 - 更窄的波动范围
        for (let x = 0; x < canvas.width; x += 20) {
            const y = Math.sin(x * 0.01 + time + i) * 30 + auroraHeight * (0.5 + i * 0.1);
            ctx.lineTo(x, y);
        }
        
        ctx.lineTo(canvas.width, auroraHeight * 0.8);
        ctx.closePath();
        
        // 极光颜色 - 增加不透明度
        const colors = [
            'rgba(0, 255, 140, 0.3)',
            'rgba(80, 200, 255, 0.3)',
            'rgba(140, 100, 255, 0.3)'
        ];
        
        ctx.fillStyle = colors[i];
        ctx.fill();
    }
}

// 启动动画
animate();
