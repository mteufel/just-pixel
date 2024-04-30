<script>
import {createBasicDialogStore} from "../stores/BasicDialogStore";
const HelpStore = createBasicDialogStore()
export default {
  helpStore: HelpStore,
}
</script>

<script setup>
import { ref } from 'vue'
import {KeyDownBuilder} from "../builders/KeyDownBuilder";
import { DownSquareOutlined, UpSquareOutlined, LeftSquareOutlined, RightSquareOutlined } from '@ant-design/icons-vue';
import { green } from '@ant-design/colors';

const helpVisible = ref(HelpStore.isVisible())
HelpStore.subscribe( () => helpVisible.value = HelpStore.isVisible())
const iconStyle = ref("font-size: 1.5em; color: " + green[6])

const columns = [
  {
    name: 'Group',
    dataIndex: 'group',
    key: 'group',
    width: '125px'
  },
  {
    title: 'Key',
    dataIndex: 'keys1',
    key: 'keys1',
    width: '100px'
  },
  {
    title: 'Key',
    dataIndex: 'keys2',
    key: 'keys2',
    width: '100px'
  },
  {
    title: 'Action',
    dataIndex: 'action',
    key: 'action',
    idth: '500px'
  }
];

const okPressed = () => {
  console.log('okv p')
}

</script>

<template>
  <a-modal title="Help"
           width="1000px"
           :closable="true"
           :open=helpVisible
            @cancel="HelpStore.toggle()"
            :okButtonProps="{ style: { display: 'none' } }"
            :cancelButtonProps="{ type: 'primary'}">

    <a-table :columns="columns" :data-source="KeyDownBuilder.getHelp()" :scroll="{ y: 500 }" :pagination="false">
      <template #headerCell="{ column }">
        <template v-if="column.key === 'group'">
        <span>
          Group
        </span>
        </template>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'group'">
          {{ record.group }}
        </template>
        <template v-else-if="column.key === 'keys1'">
        <span>
            <template v-for="tag in record.keys" :key="keys1">
              <template v-if=" ['Shift', 'Alt', 'Ctrl', 'SHIFT', 'ALT', 'CTRL'].indexOf(tag) != -1"><a-tag :color="'green'">{{ tag.toUpperCase() }}</a-tag></template>
            </template>
        </span>
        </template>
        <template v-else-if="column.key === 'keys2'">
        <span>
            <template v-for="tag in record.keys" :key="keys2">
              <template v-if=" ['Shift', 'Alt', 'Ctrl', 'SHIFT', 'ALT', 'CTRL'].indexOf(tag) != -1"></template>
              <template v-else-if="tag==='ArrowDown'"><DownSquareOutlined :style="iconStyle"  /></template>
              <template v-else-if="tag==='ArrowUp'"><UpSquareOutlined :style="iconStyle"  /></template>
              <template v-else-if="tag==='ArrowLeft'"><LeftSquareOutlined :style="iconStyle"  /></template>
              <template v-else-if="tag==='ArrowRight'"><RightSquareOutlined :style="iconStyle"  /></template>
              <template v-else><a-tag :color="'green'">{{ tag.toUpperCase() }}</a-tag><br></template>
            </template>
        </span>
        </template>
        <template v-else-if="column.key === 'action'">
        <span>
          {{ record.action }}
        </span>
        </template>
      </template>
    </a-table>
    <br>
    <a-tag color="#108ee9"><a href="https://github.com/mteufel/just-pixel" target="_blank">Source on Github</a></a-tag>
    <br><br>(c) 2020-2024 Marc Teufel (Seytan/Reflex/APS)

  </a-modal>
</template>

