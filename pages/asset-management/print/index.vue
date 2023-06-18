<template>
  <a-card class="shadow">
    <div class="print">
      <!-- OUTPUT -->
      <div class="output">
        <a-button type="primary" v-print="'#printMe'">{{ $t("print") }}</a-button>
        <span class="size">
          <span>Size item</span>
          <a-slider id="test" v-model="size" :min="1" :marks="marks" :default-value="15" :tip-formatter="formatter" />
        </span>
      </div>
      <br />

      <!-- SOURCE -->
      <div id="printMe">
        <div v-for="(item, index) in dataSource" :key="index" class="item-element">
          <div class="wrap-element" :style="{ width: size * 8 + 'px' }">
            <img :key="index" :src="item.code" :alt="item.name" style="width: 100%" />
            <span :style="{ fontSize: fontSize(item.name) }">{{ item.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </a-card>
</template>

<script>
export default {
  name: "print",
  middleware: "permissions",
  meta: {
    permissions: ["admin", "manager", "leader", "developer", "tester", "asset_admin"]
  },
  data() {
    return {
      dataSource: [], // [{name, code},..]
      marks: {
        15: "15mm",
        100: {
          style: {
            color: "#f50"
          },
          label: <strong>100mm</strong>
        }
      },
      size: 10
    };
  },
  methods: {
    checkRouter() {
      if (this.$route.params) {
        const { message } = this.$route.params;
        if (message) {
          this.dataSource = [...message];
        }
      }
    },
    formatter(value) {
      return `${value}mm`;
    },
    fontSize(name) {
      return (this.size / name.length) * 14 + "px";
    }
  },
  mounted() {
    this.checkRouter();
  }
};
</script>

<style lang="less" scoped>
.output {
  display: flex;
  align-items: center;

  *:only-child {
    display: inline-block;
  }

  .size {
    width: 100%;
    margin-left: 10px;

    *:only-child {
      display: block;
    }
    .ant-slider {
      width: 30%;
      margin-left: 10px;
      @media (max-width: 767px) {
        width: 100%;
      }
    }
  }
}

#printMe {
  display: table;
  direction: ltr;

  .item-element {
    display: inline-block;
    margin: 5px;
    padding: 5px;

    .wrap-element {
      display: table;
      color: red;
      span {
        display: block;
        text-align: center;
      }

      img {
        max-width: 100%;
        display: block;
        margin: 2px;
      }
    }
  }
}

@media print {
  #printMe(); // mixin from screen style

  .print {
    #printMe {
      // override some rules

      .item-element {
        page-break-inside: avoid;
        -webkit-region-break-inside: avoid;
        .wrap-element {
          img {
            page-break-inside: avoid;
            -webkit-region-break-inside: avoid;
          }
        }
      }
    }
  }

  @page {
    size: portrait;
  }
}
</style>
