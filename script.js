// 获取画布和上下文
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 设置画布尺寸为窗口大小
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 设置固定画布尺寸，不再响应窗口大小变化
const fixedWidth = 1200;
const fixedHeight = 800;
canvas.width = fixedWidth;
canvas.height = fixedHeight;

// 颜色配置
const colors = {
    fireworks: ['#ff8c69', '#ff6b6b', '#ffb6c1', '#ffc0cb', '#dda0dd', '#ee82ee', '#da70d6'],
    flowers: ['#ffb6c1', '#ffc0cb', '#dda0dd', '#ee82ee', '#da70d6'],// 浅粉色和浅紫色
    sparkle: ['#FFD700', '#00FFFF', '#FF69B4', '#00FF00', '#FFA500'] // 闪烁颜色
};

// ===== 星星特效 =====
class Star {
    constructor() {
        this.x = Math.random() * canvas.width; // 鲜花从画布最左侧到最右侧均匀分布 // 星星从画布最左侧到最右侧均匀分布
        // 星星位于极光下方，占画面的20%
        this.y = canvas.height * 0.2 + Math.random() * canvas.height * 0.375; // 增加星辰高度比例至1.25倍
        this.size = Math.random() * 4 + 2; // 增加星辰宽度
        this.blinkSpeed = Math.random() * 0.05 + 0.01;
        this.alpha = Math.random();
        this.alphaChange = this.blinkSpeed;
        // 将星星分为三组，每组闪烁频率不同
        this.group = Math.floor(Math.random() * 3); // 0, 1, 2 三组
        this.blinkOffset = this.group * (Math.PI * 2 / 3); // 三组之间的相位差
        
        // 流星效果属性
        this.isMeteor = Math.random() < 0.02; // 2%的星星会变成流星
        this.meteorSpeed = Math.random() * 3 + 1.5;
        this.meteorAngle = Math.atan2(mouseY - this.y, mouseX - this.x); // 流星飞向鼠标位置
        this.tailLength = Math.random() * 50 + 20;
        this.tail = [];
    }

    // 星星闪烁效果已在update方法中重新实现

    update() {
        // 基于时间和组别计算闪烁效果
        const time = Date.now() * 0.001; // 当前时间（秒）
        // 根据组别计算不同的闪烁周期
        this.alpha = 0.3 + 0.7 * Math.sin(time * this.blinkSpeed + this.blinkOffset);
        
        // 流星移动逻辑
        if (this.isMeteor) {
            this.x += Math.cos(this.meteorAngle) * this.meteorSpeed;
            this.y += Math.sin(this.meteorAngle) * this.meteorSpeed;
            
            // 保存轨迹
            this.tail.push({x: this.x, y: this.y});
            if (this.tail.length > this.tailLength) {
                this.tail.shift();
            }
            
            // 如果流星飞出画布，重置位置
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height * 0.2;
                this.tail = [];
            }
        }
    }

    draw() {
        // 如果是流星，绘制流星尾巴
        if (this.isMeteor && this.tail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.tail[0].x, this.tail[0].y);
            
            // 绘制流星尾巴
            for (let i = 1; i < this.tail.length; i++) {
                const progress = i / this.tail.length;
                const alpha = this.alpha * progress;
                const lineWidth = this.size * progress * 1.33; // 流星轨迹宽度改为原来的2/3
                
                ctx.lineTo(this.tail[i].x, this.tail[i].y);
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.lineWidth = lineWidth;
                ctx.stroke();
            }
        }
        
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
        const isGold = Math.random() < 0.67; // 2/3概率为金黄色
        ctx.fillStyle = isGold ? `rgba(255, 215, 0, ${this.alpha})` : `rgba(255, 255, 255, ${this.alpha})`;
        ctx.fill();
        ctx.restore();
    }
}

// ===== 鲜花特效 =====
class Flower {
    constructor() {
        this.x = Math.random() * canvas.width; // 鲜花从画布最左侧到最右侧均匀分布 // 星星从画布最左侧到最右侧均匀分布
        // 鲜花位于星辰下方，高度为40%
        this.y = canvas.height - Math.random() * canvas.height * 0.25; // 调整鲜花高度比例为1.25倍
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
        this.speed = 3;
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
        const fontSize = 40;
        
        // 直接绘制文字
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, this.targetX, this.targetY);
        
        // 添加简单的闪烁效果
        const particle = new Particle(
            this.targetX,
            this.targetY,
            0,
            0,
            colors.sparkle[Math.floor(Math.random() * colors.sparkle.length)],
            true
        );
        this.particles.push(particle);
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
        this.decay = isText ? 1 / 3 : 1 / 1.21; // 文字烟花显示3秒，普通烟花1.21秒
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
        
        // 绘制圆形粒子
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
let mouseX = 0;
let mouseY = 0;

// 月球类
class Moon {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.size = 30;
        this.phase = 0; // 月相(0-1)
    }

    update(targetX, targetY) {
        // 直接跟随鼠标位置
        this.x = targetX;
        this.y = targetY;
        
        // 更新月相(随时间缓慢变化)
        this.phase = (this.phase + 0.000001) % 1;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = 0.5;
        
        // 绘制月球主体
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = '#f5f5dc';
        ctx.fill();
        
        // 绘制月相阴影
        ctx.beginPath();
        const shadowX = this.x + Math.cos(this.phase * Math.PI * 2) * this.size * 0.8;
        const shadowY = this.y + Math.sin(this.phase * Math.PI * 2) * this.size * 0.8;
        ctx.arc(shadowX, shadowY, this.size * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fill();
        
        // 添加月球环形山细节
        for(let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * this.size * 0.7;
            const craterSize = Math.random() * 5 + 2;
            
            ctx.beginPath();
            ctx.arc(
                this.x + Math.cos(angle) * dist,
                this.y + Math.sin(angle) * dist,
                craterSize, 
                0, 
                Math.PI * 2
            );
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fill();
        }
        
        ctx.restore();
    }
}

const moon = new Moon();

// 兔子类
class Rabbit {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.size = 20;
        this.jumpHeight = 0;
        this.jumpPhase = 0;
        this.jumpSpeed = 0.05;
    }

    update(targetX, targetY) {
        // 计算与月球保持的距离(250像素)
        const distance = 66;
        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        
        // 计算小兔子的新位置(与月球保持固定距离)
        this.x = targetX - Math.cos(angle) * distance;
        this.y = targetY - Math.sin(angle) * distance;
        
        // 确保小兔子不会超出画布边界
        this.x = Math.max(this.size, Math.min(this.x, canvas.width - this.size));
        this.y = Math.max(this.size, Math.min(this.y, canvas.height - this.size));
        
        // 跳跃动画
        this.jumpPhase = (this.jumpPhase + this.jumpSpeed) % (Math.PI * 2);
        this.jumpHeight = Math.abs(Math.sin(this.jumpPhase)) * 10;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.translate(this.x, this.y - this.jumpHeight);
        
        // 绘制兔子身体
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 1.2, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        // 绘制兔子耳朵
        ctx.beginPath();
        ctx.ellipse(-this.size * 0.7, -this.size * 1.2, this.size * 0.3, this.size * 0.8, 0, 0, Math.PI * 2);
        ctx.ellipse(this.size * 0.7, -this.size * 1.2, this.size * 0.3, this.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        // 绘制耳朵内圈(粉色)
        ctx.beginPath();
        ctx.ellipse(-this.size * 0.7, -this.size * 1.2, this.size * 0.15, this.size * 0.4, 0, 0, Math.PI * 2);
        ctx.ellipse(this.size * 0.7, -this.size * 1.2, this.size * 0.15, this.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#ffb6c1';
        ctx.fill();
        
        // 绘制兔子眼睛
        ctx.beginPath();
        ctx.arc(-this.size * 0.3, -this.size * 0.2, this.size * 0.1, 0, Math.PI * 2);
        ctx.arc(this.size * 0.3, -this.size * 0.2, this.size * 0.1, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
        
        // 绘制兔子嘴巴(粉色)
        ctx.beginPath();
        ctx.arc(0, this.size * 0.1, this.size * 0.08, 0, Math.PI);
        ctx.fillStyle = '#ffb6c1';
        ctx.fill();
        
        // 绘制四条小腿
        ctx.beginPath();
        ctx.ellipse(-this.size * 0.5, this.size * 0.8, this.size * 0.15, this.size * 0.3, 0, 0, Math.PI * 2);
        ctx.ellipse(-this.size * 0.2, this.size * 0.8, this.size * 0.15, this.size * 0.3, 0, 0, Math.PI * 2);
        ctx.ellipse(this.size * 0.2, this.size * 0.8, this.size * 0.15, this.size * 0.3, 0, 0, Math.PI * 2);
        ctx.ellipse(this.size * 0.5, this.size * 0.8, this.size * 0.15, this.size * 0.3, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        // 绘制胡萝卜
        ctx.beginPath();
        ctx.ellipse(this.size * 0.8, this.size * 0.5, this.size * 0.4, this.size * 0.15, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FF8C00';
        ctx.fill();
        
        // 胡萝卜顶部绿叶
        ctx.beginPath();
        ctx.moveTo(this.size * 0.8 + this.size * 0.4, this.size * 0.5 - this.size * 0.1);
        ctx.lineTo(this.size * 0.8 + this.size * 0.6, this.size * 0.5 - this.size * 0.3);
        ctx.lineTo(this.size * 0.8 + this.size * 0.4, this.size * 0.5 + this.size * 0.1);
        ctx.fillStyle = '#7CFC00';
        ctx.fill();
        
        ctx.restore();
    }
}

const rabbit = new Rabbit();

// 创建星星
for (let i = 0; i < 200; i++) {
    stars.push(new Star());
}

// 创建鲜花
for (let i = 0; i < 100; i++) {
    flowers.push(new Flower());
}

// 监听鼠标移动事件
canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    moon.update(mouseX, mouseY);
    rabbit.update(mouseX, mouseY);
});

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
    // 使用屏幕中央偏上作为文字烟花的目标位置
    const x = canvas.width / 2;
    const y = canvas.height * 0.5;
    
    // 从底部发射文字烟花到目标位置
    const firework = new Firework(
        Math.random() * canvas.width,
        canvas.height,
        x,
        y,
        true
    );
    fireworks.push(firework);
});

// 底部滑动文字
let bottomTextX = canvas.width;
let bottomTextColor = colors.fireworks[Math.floor(Math.random() * colors.fireworks.length)];

function updateBottomText() {
    const text = document.getElementById('text-input').value || '母亲节快乐';
    const fontSize = 40;
    
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = bottomTextColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    
    // 从右向左滑动
    bottomTextX -= 2;
    const textWidth = ctx.measureText(text).width;
    
    // 如果文字完全滑出左侧，重置到右侧并更换颜色
    if (bottomTextX + textWidth < 0) {
        bottomTextX = canvas.width;
        bottomTextColor = colors.fireworks[Math.floor(Math.random() * colors.fireworks.length)];
    }
    
    ctx.fillText(text, bottomTextX, canvas.height - 20);
}

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
    // 使用requestAnimationFrame的时间戳参数优化性能
    let lastTime = 0;
    function optimizedAnimate(timestamp) {
        // 控制帧率在60fps左右
        if (timestamp - lastTime < 16) {
            requestAnimationFrame(optimizedAnimate);
            return;
        }
        lastTime = timestamp;
        
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
    
    // 绘制月球
    moon.draw();
    rabbit.draw();
    
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
    
    // 更新并绘制底部滑动文字
    updateBottomText();
    
    // 继续动画循环
    requestAnimationFrame(optimizedAnimate);
}

// 启动动画
optimizedAnimate(0);

// 绘制极光效果
function drawAurora() {
    // 极光位于最上方20%区域
        const auroraHeight = canvas.height * 0.2;
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
}
// 启动动画
animate();
