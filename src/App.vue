<template>
  <div class="game-box" ref="gameBox">
    <div class="plane-wrap">
      <div v-if="!playState" class="playgame">点击飞机开始游戏</div>
      <img ref="mouseImg" class="mouse-img" :class="mouseMove" src="@/assets/img/phone.png" @click.stop="getMouse"
        @dblclick="clearAll" />
      <!-- 子弹 -->
      <span class="bullet" v-for="(item, index) in allBullet" :key="index"
        :style="{ top: item.y + 'px', left: item.x + 'px' }"></span>
      <!-- 敌人 -->
      <img src="@/assets/img/bug.png" class="enemy" v-for="(item, index) in allEnemy" :key="index + 4399"
        :style="{ top: item.y + 'px', left: item.x + 'px' }" />
      <!-- 得分 -->
      <div class="score-wrap" v-if="!playGameOver">
        <span class="score">消灭敌军: {{ score }}</span>
        <span class="bugnum">逃脱敌军: {{ bugNum }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
const popWidth = ref(40)
const popHeight = ref(75)
// 游戏状态
const playState = ref(false)
// 游戏结束
const playGameOver = ref(true)
const theGameOver = ref(false)
// 子弹
const allBullet = ref<any[]>([{
  x: 0,
  y: 0
}]);
// 子弹速度
const bulletSpeed = ref(5)
// 子弹发射的时间间隔
const bulletMoveTime = ref(400)
// 子弹计时器
const bulletTimer = ref<any>(null)
// 子弹数量计时器
const bulletNumTimer = ref<any>(null)
// 臭虫
const allEnemy = ref<any[]>([])
// 臭虫速度
const enemySpeed = ref(3)
// 臭虫的出现间隔时间
const enemyComeTime = ref(1200)
// 每击败一只臭虫的得分
const enemyScore = ref(10)
// 敌人计时器
const enemyTimer = ref(null)
// 敌人数量计时器
const enemyNumTimer = ref(null)
// 鼠标对象
const mouseEvent = reactive({ x: 0, y: 0 })
// 顶部的位置 navbar
const topPosition = ref(30)
// 浏览器窗口宽度高度
const windowInfo = reactive({
  windowWidth: 0,
  windowHeight: 0,
  windowLeft: 0,
  windowTop: 0,
})
// 取消上次延时未执行的方法，用于点击事件和双击
const clickTime = ref<any>(null)
// 窗口变化的防抖
const windowTime = ref(null)
// 得分
const score = ref(0)
// 逃脱的 bug 数
const bugNum = ref(0)
// 游戏结束计算得分定时器
const gOTimer = ref(null)
// 游戏结束显示得分
const gOScore = ref({
  score: 0, bugNum: 0, final: 0
})
// 飞机的ref
const mouseImg = ref()
// 游戏界面的ref
const gameBox = ref()

// 控制鼠标移动
const mouseMove = (e: any) => {
  let wLeft = windowInfo.windowLeft;
  let wTop = windowInfo.windowTop;
  // // 超出弹出层范围，暂停游戏 25是飞机的宽度，加一些容错
  if (
    e.pageX < wLeft ||
    e.pageX > wLeft + windowInfo.windowWidth + 25 ||
    e.pageY < wTop ||
    e.pageY > wTop + windowInfo.windowHeight + 25
  ) {
    // 移除飞机跟随鼠标移动事件
    // document.removeEventListener("mousemove", mouseMove, false);
    // playState.value = false;
  }
  // 减去 弹出层距离屏幕左边的距离
  mouseEvent.x = e.pageX - wLeft;
  mouseEvent.y = e.pageY - wTop;
  if (mouseImg.value) {
    mouseImg.value.style.left = e.pageX - 25 - wLeft + "px";
    mouseImg.value.style.top = e.pageY - 25 - wTop + "px";
  }
}

// 点击判断是否是游戏状态
const getMouse = () => {
  clearTimeout(clickTime.value);
  let event: any = window.event;
  clickTime.value = setTimeout(() => {
    if (!playState.value) {
      // promptMessage();
      // 获取开始时候的子弹位置
      mouseEvent.x = event.pageX ;
      mouseEvent.y = event.pageY ;
      addBullet();
      // addEnemy();
      // 添加飞机跟随鼠标移动事件
      document.addEventListener("mousemove", mouseMove);
      // 开启增加子弹、增加敌人定时器
      addBulletNumTimer();
      // addEnemyNumTimer();
      playState.value = true;
      playGameOver.value = false;
    } else {
      // 移除飞机跟随鼠标移动事件
      document.removeEventListener("mousemove", mouseMove, false);
      playState.value = false;
    }
  }, 200);
}

// 添加子弹
const addBullet = () => {
  // 需要加上窗口的距离，高度上需要减去飞机的高度
  allBullet.value.push({
    x: mouseEvent.x + windowInfo.windowLeft ,
    y: mouseEvent.y + windowInfo.windowTop - bulletSpeed.value -25,
  });
  bulletMove();
}

// 添加子弹计时器
const addBulletNumTimer = () => {
  bulletNumTimer.value = setInterval(() => {
    addBullet();
  }, bulletMoveTime.value);
}

// 子弹移动计时器
const bulletMove = () => {
  clearInterval(bulletTimer.value);
  bulletTimer.value = setInterval(() => {
    allBullet.value.forEach((item, index, arr) => {
      arr[index].y -= bulletSpeed.value;
    });
  }, 50);
}

onMounted(() => {
  // 获取边界的距离
  getWindowInfo()
  // 添加飞机跟随鼠标移动事件
  document.addEventListener("mousemove", mouseMove);
})

const getWindowInfo = () => {
  if (gameBox.value) {
    windowInfo.windowLeft = gameBox.value.offsetLeft
    windowInfo.windowTop = gameBox.value.offsetTop
    windowInfo.windowWidth = gameBox.value.offsetWidth
    windowInfo.windowHeight = gameBox.value.offsetHeight
  }
}

const clearAll = ()=>{

}

</script>
<style scoped lang="scss">
.game-box {
  width: 80vw;
  height: 80vh;
  margin: 10vh 10vw;
  border: 1px solid black;

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
}
</style>
