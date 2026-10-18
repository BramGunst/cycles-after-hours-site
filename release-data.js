// Shared offline snapshot. Refresh with: node tools/sync-releases.mjs
// Never treated as live confirmation of the latest release.
window.CAH_RELEASE_SNAPSHOT = {
  "checkedAt": "2026-10-18T12:49:40.438Z",
  "latestTag": "viewport-motion-blur-v0.2.2",
  "releases": [
    {
      "id": 407153894,
      "tag_name": "viewport-motion-blur-v0.2.2",
      "name": "Cycles After Hours - Viewport Motion Blur v0.2.2",
      "html_url": "https://github.com/BramGunst/cycles-after-hours/releases/tag/viewport-motion-blur-v0.2.2",
      "published_at": "2026-10-08T18:56:06Z",
      "draft": false,
      "prerelease": false,
      "body": "# Cycles After Hours - Viewport Motion Blur v0.2.2\n\nThis is a Windows x64 build of Blender 5.2.2 LTS with Cycles After Hours Viewport Motion Blur.\n\n## v0.2.2 - NVIDIA GPU compatibility\n\nRebuilds the Windows release with Blender 5.2's broader CUDA architecture support. This fixes missing CUDA binary kernel errors reported on NVIDIA GPUs including RTX 30-series and RTX 50-series cards.\n\nViewport Motion Blur itself is unchanged from v0.2.1. No new source patch was needed.\n\n## Viewport Motion Blur\n\nAdds true Cycles shutter-based motion blur to the Rendered Viewport using the existing Cycles motion-blur system. It is not a screen-space or post-processing blur. Existing Cycles shutter, per-object Motion Steps and deformation motion, camera motion, CUDA and OptiX paths remain in use.\n\n## Included fixes and improvements\n\n- **v0.1.1 - Motion Steps:** Fixes viewport motion corruption after changing per-object Motion Steps.\n- **v0.2.0 - Point motion BVH:** Fixes point/radius geometry when switching between static and motion point layouts in the Rendered Viewport.\n- **v0.2.0 - Live transform preview:** Animated objects and cameras can preview updated motion blur while being interactively transformed, before inserting a new keyframe.\n- **v0.2.1 - Initial viewport overlay crash:** Fixes a crash with native point/particle geometry when Viewport Motion Blur was enabled before entering Rendered shading.\n\n## Platform and integrity\n\n- Blender 5.2.2 LTS; Windows x64; Cycles CPU, CUDA and OptiX\n- Executable build revision: `2c58aabc7912`\n- Windows ZIP: `Cycles-After-Hours_Blender-5.2.2_Viewport-Motion-Blur-v0.2.2-Windows-x64.zip`\n- ZIP SHA-256: `D2E986E370EF0192B41E76EBA47F229A826974CA9860E4969C9EF03D1B1ACA6E`\n\n## Source Code\n\nComplete corresponding source is provided in `Cycles-After-Hours_Blender-5.2.2_Viewport-Motion-Blur-v0.2.2-Source.tar.xz` (SHA-256: `222CD25D347B9751948572D725619FE602837E98939B931A264235F0DBAA78FA`). It is identical to the v0.2.1 source archive because the source did not change.\n\nPatch order, licensing details and build provenance are documented in [SOURCE.md](https://github.com/BramGunst/cycles-after-hours/blob/main/SOURCE.md).\n",
      "assets": [
        {
          "name": "Cycles-After-Hours_Blender-5.2.2_Viewport-Motion-Blur-v0.2.2-Source.tar.xz",
          "size": 1772190684,
          "digest": "sha256:222cd25d347b9751948572d725619fe602837e98939b931a264235f0dbaa78fa",
          "browser_download_url": "https://github.com/BramGunst/cycles-after-hours/releases/download/viewport-motion-blur-v0.2.2/Cycles-After-Hours_Blender-5.2.2_Viewport-Motion-Blur-v0.2.2-Source.tar.xz",
          "state": "uploaded"
        },
        {
          "name": "Cycles-After-Hours_Blender-5.2.2_Viewport-Motion-Blur-v0.2.2-Windows-x64.zip",
          "size": 315400993,
          "digest": "sha256:d2e986e370ef0192b41e76eba47f229a826974ca9860e4969c9ef03d1b1aca6e",
          "browser_download_url": "https://github.com/BramGunst/cycles-after-hours/releases/download/viewport-motion-blur-v0.2.2/Cycles-After-Hours_Blender-5.2.2_Viewport-Motion-Blur-v0.2.2-Windows-x64.zip",
          "state": "uploaded"
        }
      ]
    },
    {
      "id": 394082019,
      "tag_name": "viewport-motion-blur-v0.2.1",
      "name": "Cycles After Hours - Viewport Motion Blur v0.2.1",
      "html_url": "https://github.com/BramGunst/cycles-after-hours/releases/tag/viewport-motion-blur-v0.2.1",
      "published_at": "2026-09-22T20:10:40Z",
      "draft": false,
      "prerelease": false,
      "body": "# Cycles After Hours - Viewport Motion Blur v0.2.1\n\nThis is a Windows x64 build of Blender 5.2.2 LTS with Cycles After Hours Viewport Motion Blur. This exact ZIP has been tested on two PCs.\n\n## Viewport Motion Blur\n\nAdds true Cycles shutter-based motion blur to the Rendered Viewport using the existing Cycles motion-blur system. It is not a screen-space or post-processing blur. Existing Cycles shutter, per-object Motion Steps and deformation motion, camera motion, CUDA and OptiX paths remain in use.\n\n## Included fixes and improvements\n\n- **v0.1.1 - Motion Steps:** Fixes viewport motion corruption after changing per-object Motion Steps.\n- **v0.2.0 - Point motion BVH:** Fixes point/radius geometry when switching between static and motion point layouts in the Rendered Viewport.\n- **v0.2.0 - Live transform preview:** Animated objects and cameras can preview updated motion blur while being interactively transformed, before inserting a new keyframe. This uses Blender's animation evaluation and Cycles shutter sampling.\n- **v0.2.1 - Initial viewport overlay crash:** Fixes a crash with native point/particle geometry when Viewport Motion Blur was enabled before entering Rendered shading. The initial external renderer view_update now runs before viewport overlay batch synchronization.\n\nThe v0.2.1 change is not an OptiX/BVH corruption fix and does not add a new motion-blur algorithm.\n\n## Platform and integrity\n\n- Blender 5.2.2 LTS; Windows x64; Cycles CPU, CUDA and OptiX\n- ZIP SHA-256: `129E80EB6EABCD88F90B3BF983DB3B2D7A6AD62986C9594E594C05B1C6CF40B1`\n\nThe executable reports base revision `b5330961223e` as modified: the v0.2.1 fix was compiled from the working tree before it was committed as `2c58aabc791`. The executable does not embed that later commit hash.\n\nTesting on other machines is welcome, especially with different NVIDIA GPUs and native point/particle scenes. For a crash report, please include the GPU model, render device, steps to reproduce and Blender crash log if available.\n\n## Source Code\n\nComplete corresponding source for this v0.2.1 build is available as the [source archive](https://github.com/BramGunst/cycles-after-hours/releases/download/viewport-motion-blur-v0.2.1/Cycles-After-Hours_Blender-5.2.2_Viewport-Motion-Blur-v0.2.1-Source.tar.xz) (SHA-256: `222CD25D347B9751948572D725619FE602837E98939B931A264235F0DBAA78FA`). It contains the modified Blender 5.2.2 LTS source and Blender's source dependency packages. The final source tree is represented by hotfix commit `2c58aabc791`; the executable still reports `b5330961223e (modified)` because it was built before that hotfix was committed.\n\nPatch order, licensing details and build provenance are documented in [SOURCE.md](https://github.com/BramGunst/cycles-after-hours/blob/main/SOURCE.md).\n",
      "assets": [
        {
          "name": "Cycles-After-Hours_Blender-5.2.2_Viewport-Motion-Blur-v0.2.1-Source.tar.xz",
          "size": 1772190684,
          "digest": "sha256:222cd25d347b9751948572d725619fe602837e98939b931a264235f0dbaa78fa",
          "browser_download_url": "https://github.com/BramGunst/cycles-after-hours/releases/download/viewport-motion-blur-v0.2.1/Cycles-After-Hours_Blender-5.2.2_Viewport-Motion-Blur-v0.2.1-Source.tar.xz",
          "state": "uploaded"
        },
        {
          "name": "Cycles-After-Hours_Blender-5.2.2_Viewport-Motion-Blur-v0.2.1-Windows-x64.zip",
          "size": 336963656,
          "digest": "sha256:129e80eb6eabcd88f90b3bf983db3b2d7a6ad62986c9594e594c05b1c6cf40b1",
          "browser_download_url": "https://github.com/BramGunst/cycles-after-hours/releases/download/viewport-motion-blur-v0.2.1/Cycles-After-Hours_Blender-5.2.2_Viewport-Motion-Blur-v0.2.1-Windows-x64.zip",
          "state": "uploaded"
        }
      ]
    }
  ]
};
