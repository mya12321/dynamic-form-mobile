<template>
  <div class="wrapper">
    <div class="line"></div>
    <div class="main-wrapper">
      <div class="step-wrapper" v-for="(step, index) in stepList" :key="step.id">
        <div :class="['step-icon', index < activeIndex ? 'icon-step2-before' : index == activeIndex ? 'icon-step2-current' : 'icon-step2-after']"></div>
        <div :style="index < activeIndex ? {color: '##487fff'} : index == activeIndex ? {color: '#487fff', borderBottom: '4px solid '} : {color: '#ccc'}" class="step-title">{{step.title}}</div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'headerSteps2',
    props: ['stepList', 'activeIndex'],
  };
</script>

<style scoped>
  .wrapper {
    height: 40px;
    overflow: hidden;
  }
  .line {
    border-bottom: 1px solid #eee;
    margin: 0 30px;
    transform: translateY(24px);
  }
  .main-wrapper {
    width: 100vw;
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
  .step-wrapper {
    padding: 0 8px;
    background-color: white;
    z-index: 10;
  }
  .step-icon {
    display: inline-block;
    width: 12px;
    height: 12px;
    margin: 0 4px;
    transform: translateY(2px);
  }
  .step-title {
    display: inline-block;
    font-size: 10px;
    padding: 10px 0;
  }
</style>
