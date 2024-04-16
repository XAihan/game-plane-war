<template>
	<div
		class="game-box"
		ref="gameBox"
    >
		<div class="plane-wrap">
			<div
				v-if="!playState"
				class="playgame">
				点击飞机开始游戏
			</div>
			<img
				ref="mouseImg"
				class="mouse-img"
				:class="mouseMove"
				src="@/assets/img/phone.png"
				@click.stop="getMouse"
				@dblclick="clearAll" />
			<!-- 子弹 -->
			<span
				class="bullet"
				v-for="(item, index) in allBullet"
				:key="index"
				:style="{ top: item.y + 'px', left: item.x + 'px' }"></span>
			<!-- 敌人 -->
			<img
				src="@/assets/img/bug.png"
				class="enemy"
				v-for="(item, index) in allEnemy"
				:key="index + 4399"
				:style="{ top: item.y + 'px', left: item.x + 'px' }" />
			<!-- 得分 -->
			<div
				class="score-wrap"
				v-if="!playGameOver">
				<span class="score">消灭敌军: {{ score }}</span>
				<span class="bugnum">逃脱敌军: {{ bugNum }}</span>
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
	import { ref, onMounted, reactive, watch } from 'vue';
	// 游戏状态
	const playState = ref(false);
	// 游戏结束
	const playGameOver = ref(true);
	const theGameOver = ref(false);
	// 子弹
	const allBullet = ref<any[]>([
		{
			x: 0,
			y: 0,
		},
	]);
	// 子弹速度
	const bulletSpeed = ref(5);
	// 子弹发射的时间间隔
	const bulletMoveTime = ref(400);
	// 子弹计时器
	const bulletTimer = ref<any>(null);
	// 子弹数量计时器
	const bulletNumTimer = ref<any>(null);
	// 臭虫
	const allEnemy = ref<any[]>([]);
	// 臭虫速度
	const enemySpeed = ref(3);
	// 臭虫的出现间隔时间
	const enemyComeTime = ref(1200);
	// 每击败一只臭虫的得分
	const enemyScore = ref(10);
	// 敌人计时器
	const enemyTimer = ref<number>(-1);
	// 敌人数量计时器
	const enemyNumTimer = ref<number>(-1);
	// 鼠标对象
	const mouseEvent = reactive({ x: 0, y: 0 });
	// 顶部的位置 navbar
	const topPosition = ref(0);
	// 浏览器窗口宽度高度
	const windowInfo = reactive({
		windowWidth: 0,
		windowHeight: 0,
		windowLeft: 0,
		windowTop: 0,
	});
	// 取消上次延时未执行的方法，用于点击事件和双击
	const clickTime = ref<any>(null);
	// 窗口变化的防抖
	const windowTime = ref(null);
	// 得分
	const score = ref<number>(0);
	// 逃脱的 bug 数
	const bugNum = ref(0);
	// 游戏结束计算得分定时器
	const gOTimer = ref(null);
	// 游戏结束显示得分
	const gOScore = ref({
		score: 0,
		bugNum: 0,
		final: 0,
	});
	// 飞机的ref
	const mouseImg = ref();
	// 游戏界面的ref
	const gameBox = ref();

	// 控制鼠标移动
	const mouseMove = (e: any) => {
		let wLeft = windowInfo.windowLeft;
		let wTop = windowInfo.windowTop;
		// // 超出弹出层范围，暂停游戏 25是飞机的宽度，加一些容错
		if (e.pageX < wLeft || e.pageX > wLeft + windowInfo.windowWidth + 25 || e.pageY < wTop || e.pageY > wTop + windowInfo.windowHeight + 25) {
			// 移除飞机跟随鼠标移动事件
			// document.removeEventListener("mousemove", mouseMove, false);
			// playState.value = false;
		}
		// 减去 弹出层距离屏幕左边的距离
		mouseEvent.x = e.pageX - wLeft;
		mouseEvent.y = e.pageY - wTop;
		if (mouseImg.value) {
			mouseImg.value.style.left = e.pageX - 25 - wLeft + 'px';
			mouseImg.value.style.top = e.pageY - 25 - wTop + 'px';
		}
	};

	// 点击判断是否是游戏状态
	const getMouse = () => {
		clearTimeout(clickTime.value);
    	// 添加飞机跟随鼠标移动事件
		document.addEventListener('mousemove', mouseMove);
		let event: any = window.event;
		clickTime.value = setTimeout(() => {
			if (!playState.value) {
				// promptMessage();
				// 获取开始时候的子弹位置
				mouseEvent.x = event.pageX - windowInfo.windowLeft;
				mouseEvent.y = event.pageY - windowInfo.windowTop;

				// 添加子弹和敌人
				addBullet();
				addEnemy();
				// 添加飞机跟随鼠标移动事件
				document.addEventListener('mousemove', mouseMove);
				// 开启增加子弹、增加敌人定时器
				addBulletNumTimer();
				addEnemyNumTimer();
				playState.value = true;
				playGameOver.value = false;
			} else {
				// 移除飞机跟随鼠标移动事件
				document.removeEventListener('mousemove', mouseMove, false);
				playState.value = false;
        stopBulletShot()
			}
		}, 200);
	};

	// 添加子弹
	const addBullet = () => {
		// 需要加上窗口的距离，高度上需要减去飞机的高度
		allBullet.value.push({
			x: mouseEvent.x,
			y: mouseEvent.y - bulletSpeed.value - 25,
			// x: mouseEvent.x + windowInfo.windowLeft ,
			// y: mouseEvent.y + windowInfo.windowTop - bulletSpeed.value -25,
		});
		bulletMove();
	};

	// 添加子弹计时器
	const addBulletNumTimer = () => {
		bulletNumTimer.value = setInterval(() => {
			addBullet();
		}, bulletMoveTime.value);
	};

	// 子弹移动计时器
	const bulletMove = () => {
		clearInterval(bulletTimer.value);
		bulletTimer.value = setInterval(() => {
			allBullet.value.forEach((item, index, arr) => {
				arr[index].y -= bulletSpeed.value;
			});
		}, 50);
	};

	// 添加敌人
	const addEnemy = () => {
		let x = Math.round(Math.random() * windowInfo.windowWidth);
		allEnemy.value.push({
			x: x,
			y: topPosition.value,
		});
		enemyCome();
	};

	// 敌人来了
	const enemyCome = () => {
		clearInterval(enemyTimer.value);
		enemyTimer.value = setInterval(() => {
			allEnemy.value.forEach((item, index, arr) => {
				arr[index].y += enemySpeed.value;
			});
		}, 50);
	};

	// 添加敌人计时器
	const addEnemyNumTimer = () => {
		enemyNumTimer.value = setInterval(() => {
			addEnemy();
		}, enemyComeTime.value);
	};

	// 暂停
	const stopBulletShot = () => {
		clearInterval(bulletTimer.value);
		clearInterval(bulletNumTimer.value);
		clearInterval(enemyTimer.value);
		clearInterval(enemyNumTimer.value);
	};

	onMounted(() => {
		// 获取边界的距离
		getWindowInfo();
	});

	const getWindowInfo = () => {
		if (gameBox.value) {
			windowInfo.windowLeft = gameBox.value.offsetLeft;
			windowInfo.windowTop = gameBox.value.offsetTop;
			windowInfo.windowWidth = gameBox.value.offsetWidth;
			windowInfo.windowHeight = gameBox.value.offsetHeight;
		}
	};

	const clearAll = () => {
		theGameOver.value = true;
		clearTimeout(clickTime.value);
		stopBulletShot();
		playState.value = false;
		allBullet.value = [];
		allEnemy.value = [];
		document.removeEventListener('mousemove', mouseMove, false);
    console.log('游戏结束了');
	};

	// 监听子弹，超出去除
	watch(
		allBullet,
		(e) => {
			if (e[0] && e[0].y && e[0].y <= topPosition.value) {
				e.splice(0, 1);
				bulletMove();
			}
		},
		{ deep: true },
	);

	watch(
		allEnemy,
		(e) => {
			// 如果没打死，漏过去了
			if (e[0] && e[0].y && e[0].y >= windowInfo.windowHeight) {
				e.splice(0, 1);
				enemyCome();
				bugNum.value++;
			}

			e.forEach((item, i, arr) => {
				// 遍历如果子弹和触碰到臭虫就销毁
				allBullet.value.forEach((item2, i2, arr2) => {
					if (item2.y >= item.y && item2.y <= item.y + 30 && item2.x >= item.x && item2.x <= item.x + 30) {
						arr.splice(i, 1);
						arr2.splice(i2, 1);
						score.value += enemyScore.value;
					}
				});
				// 遍历如果飞机触碰了臭虫游戏结束
				if (mouseEvent.y >= item.y - 20 && mouseEvent.y <= item.y + 50 && mouseEvent.x >= item.x - 20 && mouseEvent.x <= item.x + 50) {
					clearAll();
				}
			});
		},
		{ deep: true },
	);
</script>
<style scoped lang="scss">
	.game-box {
		width: 80vw;
		height: 80vh;
		margin: 10vh 10vw;
		border: 1px solid black;
		position: relative;
		overflow: hidden;

		.mouse-img {
			position: relative;
			width: 50px;
			height: 50px;
		}

		.bullet {
			position: absolute;
			left: 40%;
			top: 140px;
			width: 3px;
			height: 10px;
			border-top-left-radius: 50%;
			border-top-right-radius: 50%;
			/* background: #efbe50; */
			background-image: linear-gradient(#f3dd61, #e0b244);
			z-index: 2;
		}
		.enemy {
			position: absolute;
			width: 30px;
			height: 30px;
			z-index: 2;
			transform: rotateZ(180deg);
		}
	}
</style>
