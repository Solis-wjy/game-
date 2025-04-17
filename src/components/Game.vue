<template>
  <div class="game-page">
    <!-- 识别图片游戏 -->
    <div v-if="currentGameIndex === 0" class="fade-in">
      <h2>请您注意观察下列图片</h2>
      <audio :src="audioSrc" autoplay @error="handleAudioError"></audio>
      <div v-for="(option, index) in imageOptions" :key="index">
        <input type="checkbox" v-model="selectedOptions" :value="option"> {{ option }}
      </div>
      <button @click="submitImageRecognition">提交</button>
    </div>
    <!-- 描述图片游戏 -->
    <div v-if="currentGameIndex === 1" class="fade-in">
      <h2>请尽可能描述您所看到的内容(且录音)</h2>
      <audio :src="audioSrc" autoplay @error="handleAudioError"></audio>
      <input type="text" v-model="imageDescription" placeholder="描述图片">
      <button @click="startRecording">开始录音</button>
      <button @click="stopRecording">停止录音</button>
      <button @click="submitImageDescription">提交描述</button>
      <audio v-if="recordedAudioUrl" :src="recordedAudioUrl" controls></audio>
    </div>
    <!-- 点击气球游戏 -->
    <div v-if="currentGameIndex === 2" class="fade-in">
      <h2>请点破飘动的气球</h2>
      <audio :src="audioSrc" autoplay @error="handleAudioError"></audio>
      <div v-for="(balloon, index) in balloons" :key="index" @click="popBalloon(index)" :class="{ 'balloon': true, 'popped': balloon === 1 }">
        <img src="balloon.png" alt="气球">
      </div>
      <p>已打破{{ poppedBalloons }}/10</p>
      <button v-if="poppedBalloons === 10" @click="submitPopBalloons">完成游戏</button>
    </div>
    <!-- 点击颜色方块游戏 -->
    <div v-if="currentGameIndex === 3" class="fade-in">
      <h2>点击颜色方块游戏</h2>
      <p v-if="colorSquareGameStarted">请点击所有的 {{ getChineseColor(targetColor) }} 方块！</p>
      <button @click="startColorSquareGame">开始游戏</button>
      <p>{{ colorSquareStatusMessage }}</p>
      <p>已点击 {{ colorSquareScore }} / {{ targetColorCount }}</p>
      <div id="color-square-game-area" :style="{ gridTemplateColumns: 'repeat(5, 1fr)' }">
        <div v-for="(square, index) in colorSquareSquares" :key="index" :class="['square', square.color, {'clicked': square.clicked}]" @click="clickColorSquare(index)"></div>
      </div>
      <button v-if="shouldShowSubmit" @click="submitColorSquareGame">提交</button>
    </div>
    <div v-if="currentGameIndex === 4" class="fade-in">
      <h2>所有游戏已完成！</h2>
    </div>
  </div>
</template>
<script>
export default {
  name: 'GameComponent',
  data () {
    return {
      currentGameIndex: 0,
      gameTypes: ['imageRecognition', 'imageDescription', 'popBalloons', 'colorSquareGame'],
      imageOptions: [],
      selectedOptions: [],
      imageDescription: '',
      recorder: null,
      recordedChunks: [],
      balloons: Array(10).fill(0),
      poppedBalloons: 0,
      audioSrc: '',
      recordedAudioUrl: null,
      colorSquareSquares: [],
      colorSquareScore: 0,
      colorSquareStatusMessage: '游戏尚未开始。',
      colorSquareGameStarted: false,
      targetColor: '',
      targetColorCount: 0,
      shouldShowSubmit: false
    }
  },
  created () {
    this.setGameData()
  },
  methods: {
    setGameData () {
      const currentGame = this.gameTypes[this.currentGameIndex]
      if (currentGame === 'imageRecognition') {
        const imageOptionSets = [
          ['筷子', '葡萄', '毛巾', '苹果'],
          ['笔记本', '纸巾', '毛巾', '树叶'],
          ['牙刷', '毛巾', '苹果', '衣服']
        ]
        this.imageOptions = imageOptionSets[Math.floor(Math.random() * imageOptionSets.length)]
      }
      this.audioSrc = `audio/${currentGame}.mp3`
    },
    submitImageRecognition () {
      console.log('提交的选项:', this.selectedOptions)
      this.nextGame()
    },
    startRecording () {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          this.recorder = new MediaRecorder(stream)
          this.recordedChunks = []
          this.recorder.ondataavailable = event => {
            if (event.data.size > 0) {
              this.recordedChunks.push(event.data)
            }
          }
          this.recorder.onstop = () => {
            const blob = new Blob(this.recordedChunks, { type: 'audio/webm' })
            this.recordedAudioUrl = URL.createObjectURL(blob)
            console.log('录制的音频:', blob)
          }
          this.recorder.start()
        })
        .catch(error => {
          console.error('录音出错:', error)
        })
    },
    stopRecording () {
      if (this.recorder && this.recorder.state === 'recording') {
        this.recorder.stop()
      }
    },
    submitImageDescription () {
      console.log('提交的描述:', this.imageDescription)
      console.log('录制的音频 URL:', this.recordedAudioUrl)
      this.nextGame()
    },
    popBalloon (index) {
      if (this.balloons[index] === 0) {
        this.balloons[index] = 1
        this.poppedBalloons++
      }
    },
    submitPopBalloons () {
      console.log('点击气球游戏完成')
      this.nextGame()
    },
    handleAudioError () {
      console.error('音频加载失败:', this.audioSrc)
    },
    nextGame () {
      this.currentGameIndex++
      if (this.currentGameIndex < this.gameTypes.length) {
        this.resetGameData()
        this.setGameData()
      }
    },
    resetGameData () {
      this.selectedOptions = []
      this.imageDescription = ''
      this.balloons = Array(10).fill(0)
      this.poppedBalloons = 0
      this.recordedChunks = []
      this.recordedAudioUrl = null
      this.colorSquareSquares = []
      this.colorSquareScore = 0
      this.colorSquareStatusMessage = '游戏尚未开始。'
      this.colorSquareGameStarted = false
      this.targetColor = ''
      this.targetColorCount = 0
      this.shouldShowSubmit = false
    },
    startColorSquareGame () {
      if (!this.colorSquareGameStarted) {
        this.colorSquareSquares = []
        this.colorSquareScore = 0
        this.colorSquareGameStarted = true
        this.colorSquareStatusMessage = '游戏进行中... 点击所有指定颜色的方块！'
        const colors = ['red', 'yellow', 'blue', 'green']
        this.targetColor = colors[Math.floor(Math.random() * colors.length)]
        for (let i = 0; i < 25; i++) {
          const color = colors[Math.floor(Math.random() * colors.length)]
          this.colorSquareSquares.push({ color, clicked: false })
          if (color === this.targetColor) {
            this.targetColorCount++
          }
        }
      }
    },
    clickColorSquare (index) {
      const square = this.colorSquareSquares[index]
      if (this.colorSquareGameStarted && square.color === this.targetColor && !square.clicked) {
        square.clicked = true
        this.colorSquareScore++
        if (this.colorSquareScore === this.targetColorCount) {
          this.colorSquareStatusMessage = '你已点击完所有指定颜色的方块！'
          this.shouldShowSubmit = true
        }
      }
    },
    submitColorSquareGame () {
      console.log('点击颜色方块游戏完成')
      this.nextGame()
    },
    getChineseColor (color) {
      switch (color) {
        case 'red':
          return '红色'
        case 'yellow':
          return '黄色'
        case 'blue':
          return '蓝色'
        case 'green':
          return '绿色'
        default:
          return color
      }
    }
  }
}
</script>
<style scoped>
.game-page {
  text-align: center;
  padding: 20px;
}
button {
  margin: 5px;
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
input[type="text"] {
  padding: 5px;
  margin: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.balloon {
  position: absolute;
  animation: float 5s ease-in-out infinite;
}
@keyframes float {
  0% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(20px, -20px);
  }
  100% {
    transform: translate(0, 0);
  }
}
.popped {
  visibility: hidden;
}
.square {
  width: 80px;
  height: 80px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.square.red {
  background-color: red;
}
.square.yellow {
  background-color: yellow;
}
.square.blue {
  background-color: blue;
}
.square.green {
  background-color: green;
}
.square.clicked {
  opacity: 0.5;
}
#color-square-game-area {
  position: relative;
  width: 400px;
  height: 400px;
  margin: 20px auto;
  border: 2px solid #ccc;
  display: grid;
  grid-gap: 2px;
}
</style>
//
