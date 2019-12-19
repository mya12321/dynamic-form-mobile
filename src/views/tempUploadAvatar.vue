<template>
  <div class="wrapper">
    <div>请上传本人照片</div>
    <el-upload class="upload" list-type="picture-card"
               :action="baseUrl + '/api/file/form2/' + name"
               accept="image/*'"
               :show-file-list="false"
               :before-upload="handleCheck"
               :on-success="handleSuccess"
               :on-error="handleError"
               :before-remove="handleConfirm"
               :on-remove="handleRemove">
      <img v-if="imageUrl" :src="imageUrl" class="avatar">
      <i v-else class="el-icon-plus avatar-uploader-icon"></i>
    </el-upload>
  </div>
</template>

<script>
  export default {
    name: 'tempUploadAvatar',
    data() {
      return {
        imageUrl: '',
        name: '',
      };
    },
    mounted() {
      document.title = '上传照片';
      this.name = this.$route.query.name;
    },
    methods: {
      handleCheck(file) {
        if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
          this.$alert('只支持JPG或PNG的图片.', '上传失败', {
            confirmButtonText: '确定',
          });
          return false;
        }
      },
      handleSuccess(res, file) {
        this.imageUrl = URL.createObjectURL(file.raw);
        this.$alert('上传成功.');
      },
      handleError() {
        this.$alert('网络错误, 请重试.', '上传失败', {
          confirmButtonText: '确定',
        });
      },
      handleConfirm(file) {
        if (file && file.status != 'success') {
          return true;
        }
        return this.$confirm('确认删除头像' + file.name + '?', '删除确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        });

      },
      handleRemove() {
        this.imageUrl = '';
      },
    },
  };
</script>

<style scoped>
  .wrapper {
    margin: 16px;
  }
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
  .upload {
    margin: 20px 0;
  }
  .upload >>> .el-upload--picture-card {
    width: 178px;
    height: 178px;
  }
</style>
