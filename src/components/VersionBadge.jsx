import { BUILD_TIME, getDisplayVersion } from '../version';

function VersionBadge() {
  const buildTime = BUILD_TIME ? new Date(BUILD_TIME).toLocaleString() : 'local build';

  return (
    <footer className="version-badge" aria-label="Application version">
      <span>Version {getDisplayVersion()}</span>
      <span className="version-badge__build">Built {buildTime}</span>
    </footer>
  );
}

export default VersionBadge;
