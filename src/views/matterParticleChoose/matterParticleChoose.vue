<template>
  <div>
    <div class="legacy-notice" v-if="legacyUserMatter && legacyUserMatter.id" @click="gotoMatterDetail">
      <span>您当前还有一个未完成的业务, 是否继续填写</span>
      <span>
        <span>去填写</span>
        <span class="gt-icon">&gt;</span>
      </span>
    </div>
    <div class="particle_choose_main_wrap" :style="legacyUserMatter && legacyUserMatter.id ? {height: 'calc(100vh - 120px)'} : {height: 'calc(100vh - 80px)'}" ref="partMainWrap">
        <div class="item_block" v-for="(item, index) in noticeList" :key="index">
            <div class="item_block_title" v-if="item.type!=='file'&&item.type!=='link' && !(item.type==='sample' && !schema.length && !samplesList.length)">
                <img v-if="item.icon" :src="item.icon" width="18px" height="18px" />
                <img v-else src="@/assets/img/qianming_luru_1@2x.png" width="18px" height="18px" />
                <span>{{item.name}}</span><br />
                <span class="title_detail">{{item.details}}</span>
            </div>

            <!-- 类型为text项的模块 -->
            <div
                class="item_block_content"
                v-if="item.type==='text' || item.type==='other'"
            >
                <div :class="expandStatus[index] ? '' : 'cols_block'" ref="itemBlockContent">
                    <div v-html="item.content"></div>
                    <div class="item_content_operation">
                        <el-button
                            type="primary"
                            icon="el-icon-phone"
                            size="mini"
                            plain
                            @click.stop="call(govTel)"
                            v-if="item.isCall==='Y'"
                        >
                            咨询
                        </el-button>
                        <el-button
                            type="primary"
                            icon="el-icon-location"
                            size="mini"
                            plain
                            @click.stop="navigate(govPos, govAddress)"
                            v-if="item.navigate==='Y' && govPos.lat && govPos.lng"
                        >
                            导航
                        </el-button>
                    </div>
                </div>
            </div>

            <!-- 类型为text项的模块(线上办理需要准备的材料) -->
            <div class="item_block_content file_block"  v-if="item.type==='sample'" v-show="schema.length || samplesList.length" ref="itemBlockContent">
                <div v-if="schema.length || samplesList.length">
                      <!-- 这里放逻辑树选择部分 -->
                      <DynamicForm2 :schema="schema" :content="content" :rule="rule" @change="processTree"></DynamicForm2>

                      <div class="divide_block" v-if="samplesList.length"></div>

                      <!-- 这里是根据逻辑树的选择，显示的所需的样本材料 -->
                      <div class="sample_block" v-if="samplesList.length">
                        <div class="title">办理材料</div>
                        <div class="samples">
                          <div
                            class="sample_item"
                            v-for="(item, index) in samplesList"
                            :key="index"
                            @click.stop="querySample(item)"
                          >
                            <div class="item name">{{item.swatchName}}</div>
                            <div class="item query">
                              查看&nbsp;&gt;
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="sample_block" v-else-if="groupList.length">
                        <span class="sample_empty_text">该情形下, 暂无办理材料, 您可以点击下方“立即办理”直接在线办理事项。</span>
                      </div>
                      <div class="sample_block" v-else>
                        <span class="sample_empty_text">请先完成选择, 选择完成后将会呈现办理材料。</span>
                      </div>
                </div>
            </div>

            <!-- 类型为file项的模块 -->
            <!-- <div class="item_block_content" v-if="item.type==='file'"></div> -->

            <!-- 类型为link项的模块 -->
            <!-- <div class="item_block_content" v-if="item.type==='link'"></div> -->

            <!-- 展开或收缩点击bar -->
            <div class="exp_cols_bar" @click.stop="expandNotice(index)" v-if="item.type!=='sample'&&item.type!=='file'&&item.type!=='link'">
                <div v-if="showExpandBar[index]">
                    <span>{{expandStatus[index] ? '收起更多' : '查看更多'}}</span>
                    <i v-if="expandStatus[index]" class="el-icon-arrow-up"></i>
                    <i v-else class="el-icon-arrow-down"></i>
                </div>
            </div>
        </div>
      <div class="agree">
        <el-checkbox v-model="checkVal">&nbsp;</el-checkbox>
        <div class="protocol">
          <span>我已阅读并同意</span>
          <a href="https://api.fuwugongshe.com/assets/agreement/registration.html">《服务协议》</a>
          <span>、</span>
          <a href="https://api.fuwugongshe.com/assets/agreement/affirm.html">《免责声明》</a>
        </div>
      </div>
    </div>
    <div class="button-area">
      <el-button class="bottom-button" type="primary" :disabled="!checkVal" round @click="createMatter">立即办理</el-button>
    </div>
  </div>
</template>

<style src="./matterParticleChoose.css" lang="css" scoped></style>
<script src="./matterParticleChoose.js"></script>
