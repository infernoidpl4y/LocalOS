<?php require_once(OS_STYLES_DIR."desktop_styles.php"); ?>
<body class="desktop">
  <div class="apps">
    <h1>Welcome <?= $_SESSION['user']; ?></h1>
  </div>
  <footer class="taskbar">
    <form method="POST"><input type="text" hidden="true" name="command" value="poweroff"><input type="submit" value="PowerOFF"></form>
  </footer>
</body>