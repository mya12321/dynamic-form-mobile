<template>
    <div class="sample_preview_main_warp" ref="sample">
        <div class="content_block">
            <div class="title">
                <span>{{sampleData.swatchName}}</span>
            </div>

            <div class="summary" v-if="sampleData.swatchExplain">
                <div class="summary_title">材料说明: </div>
                <div class="summary_content">{{sampleData.swatchExplain}}</div>
            </div>

            <div class="sample_preview" v-if="sampleData.swatchUrl">
                <div class="preview_tip">样本预览: </div>

                <div class="preview_wrap" :style="iframeWrapper">
                    <iframe :src="sampleData.swatchUrl" frameborder="0" ref="iframe" @load="loadIframe"></iframe>
                    <div class="mask" @click="goto(sampleData.swatchUrl)"></div>
                </div>
            </div>
          <div class="attach-file" v-else-if="sampleData.fileName">
            <i :class="iconClassMap[sampleData.suffix]" v-if="iconClassMap[sampleData.suffix]"></i>
            <div class="attach-icon" v-else>
              <span>{{sampleData.suffix.charAt(1).toUpperCase()}}</span>
            </div>
            <span>{{sampleData.fileName}}</span>
          </div>
        </div>

        <div class="download_bar" v-if="sampleData.filePath">
            <!--<label for="downloadFile">-->
              <el-button
                type="primary"
                icon="el-icon-download"
                size="mini"
                plain
                @click="download">
                <!--@click.stop="downloadFile(sampleData.filePath)"-->
                <span id="downloadFile" class="down_link">下载</span>
              </el-button>
            <!--</label>-->
        </div>
    </div>
</template>

<style src="./samplePreview.css" lang="css" scoped></style>
<script src="./samplePreview.js"></script>
