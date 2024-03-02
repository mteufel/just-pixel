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
  const helpData = ref(KeyDownBuilder.getHelp())
  const iconStyle = ref("font-size: 1.5em; color: " + green[6])

  const columns = [
    {
      name: 'Group',
      dataIndex: 'group',
      key: 'group',
    },
    {
      title: 'Key',
      dataIndex: 'keys',
      key: 'keys',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
    }
  ];


</script>

<template>
  <a-modal title="Help"
           :closable="true"
           :open=helpVisible
           @cancel="HelpStore.toggle()">

    <a-table :columns="columns" :data-source="helpData" :pagination="{ pageSize: 7, defaultCurrent: 1 }">
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
        <template v-else-if="column.key === 'keys'">
        <span>
          <template v-if="record.keys[0] === 'ArrowDown'">
            <DownSquareOutlined :style="iconStyle"  />
          </template>
          <template v-else-if="record.keys[0] === 'ArrowUp'">
            <UpSquareOutlined :style="iconStyle"  />
          </template>
          <template v-else-if="record.keys[0] === 'ArrowLeft'">
            <LeftSquareOutlined :style="iconStyle"  />
          </template>
          <template v-else-if="record.keys[0] === 'ArrowRight'">
            <RightSquareOutlined :style="iconStyle"  />
          </template>
          <template v-else>
            <a-tag
                v-for="tag in record.keys"
                :key="keys"
                :color="'green'"
            >
              {{ tag.toUpperCase() }}
            </a-tag>
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
    <a-tag color="cyan">(c) 2020-2024 Marc Teufel (Seytan/Reflex/APS)</a-tag>

  </a-modal>
</template>

