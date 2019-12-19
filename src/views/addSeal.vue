<template>
  <div class="content" :style="{height: clientHeight+'px'}">
    <div class="item">
      <div class="title">横向文字 (印章类型)</div>
      <div class="input"><input typeof="text" maxlength="12" v-model="name" placeholder="请输入横向文字，12字以内，公章此栏留空"></div>
    </div>
    <div class="item">
      <div class="title">防伪码</div>
      <div class="input"><input typeof="number" oninput="value=value.replace(/[^\d]/g,'')" maxlength="13" v-model="secCode" placeholder="请输入13位纯数字防伪码"></div>
    </div>
    <canvas id="canvas" width="250" height="250"></canvas>
    <div class="item">
      <div class="title">印章示例</div>
      <div class="example">
        <img src="@/assets/img/zw_qz_yzsl@2x.png"/>
      </div>
    </div>
    <div class="btn" @click="affirm">确认添加</div>
  </div>
</template>

<script>
  export default {
    name: 'addSeal',
    data() {
      return {
        clientHeight: '',
        companyName: '',
        name: '',
        secCode: '',
        userCompanyId: '',
        url: ''
      };
    },
    props:{},
    mounted() {
      this.clientHeight = document.documentElement.clientHeight;
      document.title = '添加印章';
      this.companyName = this.$route.query.name;
      this.userCompanyId = this.$route.query.id;
    },
    methods: {
      //添加印章
      affirm(){
        if (this.name == ""){
          this.$alert('横向文字不能为空');
        }else if (this.secCode == "" || this.secCode.length <=12){
          this.$alert('请输入正确的防伪码');
        }else {
          this.createSeal('canvas', this.companyName, this.secCode, this.name);
          var mycans = document.getElementById("canvas")
          var img = this.convertCanvasToImage(mycans);
          var file = [];
          file.push(img.getAttribute("src"))
          this.$post('api/file/base64/user-company', {
            files: file
          }).then((res) => {
            if (res.err_code == 0){
              this.url = res.body[0].url;
              this.stampAdd();
            }
          });
        }
      },
      stampAdd(){
        var remit = this.$post('api/user/company/stamp/add', {
          name: this.name,
          secCode: this.secCode,
          userCompanyId: parseInt(this.userCompanyId),
          url: this.url
        });
        Promise.all([remit]).catch(msg => {
          this.$alert(msg);
          return Promise.reject(msg);
        }).then(() => {
          this.$alert("添加成功");
          this.$router.push({
            path: 'mycorporateSeal',
          })
        });
      },
      //生成印章图片
      createSeal(id,company,security,name){
        let canvas = document.getElementById(id);
        let context = canvas.getContext('2d');
        // 绘制印章边框
        let width=canvas.width/2;
        let height=canvas.height/2;
        context.lineWidth=7;
        context.strokeStyle="#f00";
        context.beginPath();
        context.arc(width,height,110,0,Math.PI*2);
        context.stroke();

        //画五角星
        create5star(context,width,height,30,"#f00",0);

        // 绘制印章名称
        let counts = name.length;// 字数
        if (counts>5){
          context.font = '12px Helvetica'
        }else{
          context.font = '22px Helvetica';
        }
        context.textBaseline = 'middle';//设置文本的垂直对齐方式
        context.textAlign = 'center'; //设置文本的水平对对齐方式
        context.lineWidth=1;
        context.fillStyle = '#f00';
        context.fillText(name,width,height+65);

        // 绘制印章单位
        context.translate(width,height);// 平移到此位置,
        let count = company.length;// 字数
        if (count>7){
          context.font = '22px Helvetica'
        }else{
          context.font = '30px Helvetica'
        }
        let angle = 4*Math.PI/(3*(count - 1));// 字间角度
        let chars = company.split("");
        let c;
        for (let i = 0; i < count; i++){
          c = chars[i];// 需要绘制的字符   0
          if(i==0)
            context.rotate(5*Math.PI/6);
          else
            context.rotate(angle);
          context.save();
          context.translate(90, 0);// 平移到此位置,此时字和x轴垂直
          context.rotate(Math.PI/2);// 旋转90度,让字平行于x轴
          context.fillText(c,0, 5);// 此点为字的中心点
          context.restore();
        }

        // 绘制防伪
        context.translate(-20,-40);// 平移到此位置,
        let stack = [];
        for(let len = security.length,i=len;i>=0;i-- ){
          stack.push(security[i]);
        }
        security = stack.join('');
        context.font = '10px Helvetica'
        counts = security.length;// 字数
        let angles = 4*Math.PI/(20*(counts));// 字间角度
        let charss = security.split("");
        let cs;
        for (let i = 0; i < counts; i++){
          cs = charss[i];// 需要绘制的字符
          context.rotate(angles);
          context.save();
          context.translate(95, 90);// 平移到此位置,此时字和x轴垂直
          context.rotate(Math.PI/-4);// 旋转90度,让字平行于x轴
          context.fillText(cs,6, 6);// 此点为字的中心点
          context.restore();
        }

        //绘制五角星
        /**
         * 创建一个五角星形状. 该五角星的中心坐标为(sx,sy),中心到顶点的距离为radius,rotate=0时一个顶点在对称轴上
         * rotate:绕对称轴旋转rotate弧度
         */
        function create5star(context,sx,sy,radius,color,rotato){
          context.save();
          context.fillStyle=color;
          context.translate(sx,sy);//移动坐标原点
          context.rotate(Math.PI+rotato);//旋转
          context.beginPath();//创建路径
          let dig = Math.PI/5 *4;
          for(let i = 0;i< 5;i++){//画五角星的五条边
            let x = Math.sin(i*dig);
            let y = Math.cos(i*dig);
            context.lineTo(x*radius,y*radius);
          }
          context.closePath();
          context.stroke();
          context.fill();
          context.restore();
        }
      },
      //生成图片
      convertCanvasToImage (canvas) {
        var image = new Image();
        image.src = canvas.toDataURL("image/png");
        return image;
      },
    }
  };
</script>

<style scoped>
  .content{
    background-color: #F5F5F5;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }
  .item{
    background-color: #ffffff;
    padding: 0 16px;
    margin-top: 16px;
  }
  .item .title{
    font-size: 14px;
    color: #000000;
    padding: 16px 0;
  }
  .item .input{
    padding-bottom: 16px;
    font-size: 16px;
    color: #000000;
    position: relative;
  }
  .item .input .name{
    font-size: 16px;
    color: #999999;
  }
  .item .input input{
    font-size: 16px;
    color: #000000;
    border: 0;
    padding-left: 0;
    margin-left: 0;
    background-color: #ffffff;
    width: 100%;
  }
  .item .input .exhibition img{
    width: 8px;
    height: 6px;
    position: relative;
    top: -2px;
    margin-right: 4px;
  }
  .item .example{
    text-align: center;
    padding-bottom: 30px;
  }
  .item .example img{
    width: 238px;
  }
  .btn{
    height: 44px;
    margin: 20px 16px 16px 16px;
    text-align: center;
    line-height: 44px;
    border-radius: 22px;
    font-size: 16px;
    color: #ffffff;
    background-color: #4672F6;
  }
  #canvas{
    display: none;
  }
</style>
