<template>
  <div class="wrapper">
    <div class="line"></div>
    <div class="main-wrapper">
      <div class="step-wrapper" v-for="(step, index) in stepList" :key="step.id">
        <div :class="['step-icon', step.iconClass ? `${step.iconClass}-${index < activeIndex ? 'black' : index == activeIndex ? 'blue' : 'grey'}` : '']"></div>
        <div :style="index < activeIndex ? {color: '#333'} : index == activeIndex ? {color: '#6277ff'} : {color: '#999'}" class="step-title">{{step.title}}</div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'headerSteps',
    props: ['steps', 'activeIndex'],
    computed: {
      stepList() {
        if (this.steps && this.steps.length) {
          return this.steps.map(each => {
            each.id = this.generateId();
            return each;
          });
        } else {
          return [];
        }
      },
    },
    methods: {
      generateId() {
        return Math.floor(Math.random() * (1<<30)).toString(36);
      },
    },
  };
</script>

<style scoped>
  .wrapper {
    width: 90%;
    height: 50px;
    margin: 20px auto;
  }
  .line {
    border-bottom: 2px solid #eee;
    margin: 0 60px;
    transform: translateY(20px);
  }
  .main-wrapper {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
  .step-wrapper {
    width: 60px;
    background-color: white;
    z-index: 10;
  }
  .step-icon {
    width: 20px;
    height: 20px;
    margin: 0 auto 6px;
  }
  .step-title {
    font-size: 13px;
  }
</style>
