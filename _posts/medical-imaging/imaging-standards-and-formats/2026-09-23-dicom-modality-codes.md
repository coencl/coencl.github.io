---
layout: post
title: "DICOM Modality 代码速查：从 DX、XA 到 SEG、REG"
categories: [医学影像, 影像标准与格式]
tags: [DICOM, 医学影像, X射线, PACS, 影像标准]
date: 2026-09-23
---

# DICOM Modality 代码速查：从 DX、XA 到 SEG、REG

## 从一个真实的兼容性事故说起

同一台 C 形臂，换个厂商，导出的 DICOM 里 Modality 字段可能是 XA，可能是 RF，单帧拍摄模式下甚至可能是 DX。

这件事本身不算问题，问题出在软件怎么用它。如果解析逻辑写成"Modality 等于 XA 就走透视序列的分支，否则按静态片处理"，那么换一台设备，同样的图像就会走进错误的分支。更麻烦的是这类故障往往不会崩溃报错——图像照常加载，只是后续的几何参数取错了，或者帧序处理方式不对。等到有人发现导航结果偏了，回溯起来会很费劲。

所以 Modality 这个看起来最基础的字段，值得专门整理一遍：它到底代表什么，有哪些取值，以及哪些地方不能想当然。

## Modality 是什么

Modality 是 DICOM 数据集中的一个必填字段（标签 0008,0060），用一个简短的代码说明这份数据是由哪一类设备、哪一种成像方式产生的。它定义在 DICOM 标准的 PS3.3 部分，属于 General Series 模块。

它的作用主要有三个层面。在 PACS 里，它是检索和分类的主要维度，医生按 CT、MR 筛选检查靠的就是它。在阅片软件里，它决定默认的窗宽窗位预设、默认布局、默认的测量工具集。在像你们这样的专用软件里，它常常被用来判断该走哪条解析路径。

第三种用法就是风险所在——前两种用错了顶多是显示不合适，第三种用错了会影响计算结果。

下面按类别整理常见取值。需要说明的是，DICOM 标准中的完整代码集比这里列的要长，且包含若干已废止（retired）的历史代码，实际项目中以 PS3.3 的现行版本为准。这里收录的是日常会遇到的部分。

## X 射线类

| 代码 | 全称 | 说明 |
|---|---|---|
| DX | Digital Radiography | 数字化 X 射线摄影，平板探测器直接成像，单帧静态片 |
| CR | Computed Radiography | 计算机 X 射线摄影，IP 影像板经激光扫描读出，DX 的前代技术 |
| XA | X-Ray Angiography | X 射线血管造影，C 形臂产出的实时序列图像 |
| RF | Radiofluoroscopy | X 射线透视，实时连续成像 |
| RG | Radiographic Imaging | 传统屏片式 X 射线摄影 |
| MG | Mammography | 乳腺 X 射线摄影 |
| PX | Panoramic X-Ray | 口腔全景 X 射线摄影 |
| IO | Intra-Oral Radiography | 口内牙片 |
| BMD | Bone Mineral Densitometry | 骨密度测量，常见实现为双能 X 射线吸收法（DXA） |

## 断层与三维成像

| 代码 | 全称 | 说明 |
|---|---|---|
| CT | Computed Tomography | 计算机断层扫描 |
| MR | Magnetic Resonance | 磁共振成像 |
| PT | Positron Emission Tomography | 正电子发射断层，即通称的 PET |
| NM | Nuclear Medicine | 核医学，含 SPECT |
| US | Ultrasound | 超声 |
| OPT | Ophthalmic Tomography | 眼科断层成像，主要是 OCT |

## 放疗相关

| 代码 | 全称 | 说明 |
|---|---|---|
| RTIMAGE | Radiotherapy Image | 放疗影像，如射野验证片 |
| RTDOSE | Radiotherapy Dose | 剂量分布数据 |
| RTSTRUCT | Radiotherapy Structure Set | 结构集，存放靶区与危及器官的轮廓 |
| RTPLAN | Radiotherapy Plan | 放疗计划 |
| RTRECORD | RT Treatment Record | 治疗实施记录 |

这一组的特点是：除 RTIMAGE 外，其余几个装的都不是图像，而是几何与计划数据。这一点提醒我们，Modality 不等于"图像类型"。

## 非影像与辅助类

| 代码 | 全称 | 说明 |
|---|---|---|
| SC | Secondary Capture | 二次捕获，由其他来源转换成 DICOM 的图像 |
| SR | Structured Report | 结构化报告 |
| PR | Presentation State | 显示状态，记录窗宽窗位、标注、缩放、翻转等 |
| KO | Key Object Selection | 关键图像标记 |
| SEG | Segmentation | 分割结果 |
| REG | Registration | 配准变换数据 |
| PLAN | Plan | 计划数据 |
| DOC | Document | 封装文档，例如内嵌的 PDF |
| OT | Other | 其他，未归入已有类别 |

## 其他专科

| 代码 | 全称 | 说明 |
|---|---|---|
| ES | Endoscopy | 内窥镜 |
| XC | External-Camera Photography | 体表摄影 |
| OP | Ophthalmic Photography | 眼科摄影 |
| SM | Slide Microscopy | 玻片显微镜，数字病理 |
| ECG | Electrocardiography | 心电 |
| EPS | Cardiac Electrophysiology | 心脏电生理 |
| IVUS | Intravascular Ultrasound | 血管内超声 |

## 摄影与透视：不要都叫"X 光"

中文里习惯把一切 X 射线成像统称"X 光"或"拍片子"，但在技术文档和代码里，这种笼统会直接导致理解偏差。

**Radiography（摄影）** 是曝光一次得到一张静态图像。DX、CR、RG、MG 都属于这一类。特征是单帧、高分辨率、剂量相对集中在一次曝光。

**Fluoroscopy（透视）** 是连续出像，屏幕上能看到实时画面。RF 是它的直接对应代码，XA 也属于实时成像这一类。特征是多帧序列、单帧剂量低但累积时间长、分辨率通常不如摄影。

这两者的差别不只是"一张"和"一串"。它们的图像特性、几何信息的完整程度、以及后处理方式都不同。写文档时，radiography 译"X 射线摄影"，fluoroscopy 译"X 射线透视"，别混成一个词。

对做术中导航的人来说，这个区分尤其重要。C 形臂属于透视设备，它产出的图像在几何标定、畸变校正、帧间一致性上都有自己的一套要求，和拿一张术前的 DX 平片完全是两回事。

## 三个实战坑点

### 一、XA 的字面含义与实际用法不一致

XA 全称是 X-Ray Angiography，字面是血管造影。但在骨科、脊柱外科这类不打造影剂的场景里，C 形臂产出的透视序列同样经常被标成 XA。

原因是厂商的固件大多沿用了介入设备的输出配置，而不是按每次检查的实际用途去区分。所以看到 XA 不能推断做过造影，看到没打造影剂也不能推断 Modality 一定不是 XA。

如果软件里有任何逻辑依赖"是否造影"这个判断，不要用 Modality 去推。

### 二、同类设备的标法在厂商之间不统一

这是开篇那个场景的根源。同样是术中 C 形臂：

- 多数厂商的连续透视输出标 XA
- 部分设备标 RF
- 单帧"拍照"模式下，有的标 DX，有的仍标 XA 并输出单帧序列

没有哪一种标法违反标准，标准本身给的就是一个可选值域，厂商按自己的理解选。

### 三、只按 Modality 分支是脆弱的

以上两点合起来的结论是：Modality 适合用来做分类和展示，不适合作为解析逻辑的唯一依据。

更稳的做法是结合几个字段一起判断：

- **SOP Class UID（0008,0016）** 比 Modality 精确得多。它明确指出这是哪一类信息对象，例如 X-Ray Angiographic Image Storage 与 Digital X-Ray Image Storage 是两个不同的 UID，不会像 Modality 那样混用。
- **Number of Frames（0028,0008）** 直接告诉你是单帧还是多帧，不用靠 Modality 去猜。
- **具体的几何标签**，比如距离源到探测器、距离源到患者这类字段是否存在、是否有值。

判断逻辑写成"先看 SOP Class UID，再用帧数和关键几何标签兜底，Modality 只作参考"，比单靠一个字段健壮得多。

### 顺带说说 SEG 和 REG

这两个代码在做三维重建和导航的团队里值得单独关注，因为它们正好对应两件我们天天在做的事。

**SEG** 对应的是 Segmentation Storage，用来存放分割结果。很多软件习惯把分割结果存成自定义格式，或者干脆存成一套 mask 图像。用 DICOM SEG 的好处是：它和原始图像的空间关系是标准化描述的，每个分段的含义可以挂标准术语编码，别的系统拿到能直接理解。

**REG** 对应的是 Spatial Registration Storage，用来存放配准变换。同理，把一个变换矩阵存成自定义的 txt 或 json，只有自家软件认；存成 REG，任何支持的系统都能用。

这件事在注册申报时也有实际价值。审评关注数据的互操作性和可追溯性，用标准对象类型比自定义格式更容易说清楚。如果产品将来要和医院的 PACS 或第三方工作站对接，这一步省下的沟通成本很可观。

## 给软件兼容性测试的用例设计建议

如果你负责这块的测试，Modality 相关的用例建议按下面几个维度铺开。

**按设备厂商铺。** 能拿到的 C 形臂型号，每一款都导一套 DICOM 进来跑一遍。这是最直接有效的一类用例，也是最容易被跳过的——因为借设备麻烦。可以配合临床试用的机会积累样本库，每接触一台新设备就留一份脱敏数据。

**按成像模式铺。** 同一台设备的连续透视、单帧拍摄、不同的采集协议，分别导出测试。前面说过，同一台机器不同模式下的 Modality 可能就不一样。

**按字段组合造边界用例。** Modality 为空、Modality 为 OT、Modality 与 SOP Class UID 不匹配、多帧对象标成单帧类型——这些在真实数据里都出现过。软件应该能给出明确的提示，而不是静默走错分支。

**造一组回归基线。** 把上述样本固定成一个测试数据集，每次版本提测都跑一遍。DICOM 解析这块的改动风险很高，人工抽查覆盖不住。

**记录样本的来源信息。** 每份测试数据要记清楚来自哪台设备、哪个型号、哪个软件版本导出。将来出问题时，这些信息决定了你能不能快速定位是哪一类设备的兼容性问题。
