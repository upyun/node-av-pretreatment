# upyun-av-pretreatment
upyun 音视频处理 SDK

## Install
```sh
$ npm install upyun-av-pretreatment
```

## Example
```js
var UpYunAV = require('./');

var client = new UpYunAV(yourbucket, operator, password);
var tasks = [
    {
        type: 'hls',
        hls_time: 6,
        bitrate: '500',
        rotate: 'auto',
        format: 'mp4'
    },
    {
        type: 'thumbnail',
        thumb_single: false,
        thumb_amount: 100,
        format: 'png'
    }
];

client.pretreatment('/video/20130514_190031.mp4', {
    bucket_name: yourbucket,
    tasks: new Buffer(JSON.stringify(tasks)).toString('base64'),
    notify_url: 'http://example.com/'
}, function(err, result) {
    console.log(arguments);
});
```

## API

### 初始化 `UpYunAV(yourbucket, operator, password)`

* `yourbucket`: 空间名称
* `operator`: 操作员名称
* `password`: 操作员密码

### 处理 API `.pretreatment(path, config, callback)`

* `path`: 待处理的视频文件路径
* `config`: 处理参数
    * `bucket_name`: 所在空间名称
    * `tasks`：提交的任务数据，base64处理之后的字符串
    * `notify_url`: 异步回调地址，在处理完成之后将会进行异步通知
    * `source`: 待处理源文件路径

其中 `task` 通过下面三个步骤生成：

1. 组装业务参数；
2. 将业务参数转换为JSON字符串；
3. 对第二步生成的字符串进行 base64 encode 处理。

每次请求可以针对同一个文件提交最多10个处理任务

#### 处理参数
又拍云的音视频处理服务目前支持三种类型的处理请求：

* 普通视频转码
* HLS切割
* 视频截图

1. 视频转码

| 参数              | 参数类型 | 必选  | 参数说明                                                                                                     |
|-------------------|----------|-------|--------------------------------------------------------------------------------------------------------------|
| type              | string   | true  | 处理类型，进行视频转码时值必须为 `video`                                                                     |
| bitrate           | integer  | false | 视频比特率，单位kbit，未传递是按照视频原始比特率处理                                                         |
| scale             | string   | false | 视频分辨率，格式 "1024:768" ，不传递时按照原始分辨率处理                                                     |
| auto_scale        | boolean  | false | 是否根据分辨率自动调整视频长宽比例，仅当传递了 `scale` 参数时有效                                            |
| frame_rate        | ingeger  | false | 设置帧率，每秒显示的帧数，常用帧率："24"、"25"、"30"等， 未传递时按照原始帧率处理                            |
| rotate            | string   | false | 旋转角度，默认按照原始视频角度处理                                                                           |
| map_metadata      | boolean  | false | 是否保留视频meta信息，默认值 `true`                                                                          |
| disable_audio     | boolean  | false | 是否禁掉音频，默认 `false`                                                                                   |
| disable_video     | boolean  | false | 是否禁掉视频，默认 `false`                                                                                   |
| format            | string   | false | 视频输出格式，支持 mp4/flv，默认按照原始格式输出                                                             |
| accelerate_factor | float    | false | 设置视频加速的倍数，取值范围［1.0， 10.0］这个值是一个浮点数，可以是"2.5"，表示加速2.5倍                     |
| save_as           | string   | false | 转码后输出的文件保存路径（同一个空间下），如果没有传递，会根据请求的参数生成一个文件名保存在原始文件同目录下 |

2. HLS转码切割

HLS 转码切割处理除了 `hls_time` 之外其他参数与普通视屏转码一致

| 参数     | 参数类型 | 必选 | 参数说明                              |
|----------|----------|------|---------------------------------------|
| type     | string   | true | 处理类型，进行hls切片时值必须为 `hls` |
| hls_time | integer  | true | 指定切割的时间片长度                  |

3. 视频截图

| 参数         | 参数类型 | 必选  | 参数说明                                                      |
|--------------|----------|-------|---------------------------------------------------------------|
| type         | string   | true  | 处理类型，截图时值必须为 `thumbnail`                          |
| thumb_single | boolean  | true  | 是否仅截取单张图片，默认值 `true`                             |
| thumb_amount | integer  | false | 截图数量，当 thumb_single 参数的值为 `false` 是，本参数为必须 |
| thumb_start  | string   | false | 截图开始时间，格式为 "00:04:13"，默认值为 "00:00:00"          |
| thumb_end    | string   | false | 截图结束时间，格式为 "00:04:13"，默认值为视频结束时间         |
| thumb_scale  | string   | false | 截图尺寸，格式为 "1024:768"，默认值为视频原始尺寸             |
| thumb_format | string   | false | 截图输出格式，支持 png/jpg 格式，默认 jpg                     |


### 返回数据
成功提交处理请求之后，接口会针对每个提交的处理任务返回唯一的`task_id`，可以根据这个 `task_id` 查询处理进度。

特别地，返回的 `task_id` 的顺序与提交的任务参数 tasks 里的匹配对应。

```js
[
    '35f0148d414a688a275bf915ba7cebb2',
    '98adbaa52b2f63d6d7f327a0ff223348',
    ...
]

```