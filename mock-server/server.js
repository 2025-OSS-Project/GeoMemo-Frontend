const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());

// 메모리 기반 데이터 저장소 (실제 DB 대신)
let memos = [];
let users = [
  {
    id: 1,
    email: 'test@example.com',
    nickname: '테스트유저',
    profileImage: null
  }
];

// 인증 미들웨어 (간단한 토큰 검증)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '인증 토큰이 필요합니다' });
  }

  // 간단한 토큰 검증 (실제로는 JWT 등을 사용)
  if (token === 'test-token') {
    req.user = { id: 1, email: 'test@example.com' };
    next();
  } else {
    return res.status(403).json({ error: '유효하지 않은 토큰입니다' });
  }
};

// API 라우트

// 1. 지도 경계 데이터 전송
app.post('/api/map-bounds', (req, res) => {
  const { bounds, timestamp, deviceInfo } = req.body;
  
  console.log('📡 지도 경계 데이터 수신:', { bounds, timestamp, deviceInfo });
  
  res.json({
    success: true,
    message: '지도 경계 데이터가 성공적으로 저장되었습니다',
    data: {
      bounds,
      timestamp,
      deviceInfo
    }
  });
});

// 2. 메모 목록 조회 (API 명세서에 맞춤)
app.get('/api/memos', authenticateToken, (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedMemos = memos.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: {
      memos: paginatedMemos.map(memo => ({
        memoId: memo.memoId,
        content: memo.content,
        createdAt: memo.createdAt,
        updatedAt: memo.updatedAt,
        isPublic: memo.isPublic,
        fileUrl: memo.fileUrl,
        location: memo.location,
        user: memo.user
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(memos.length / limit),
        totalItems: memos.length,
        hasNext: endIndex < memos.length
      }
    }
  });
});

// 3. 메모 상세 조회 (API 명세서에 맞춤)
app.get('/api/memos/:id', authenticateToken, (req, res) => {
  const memoId = parseInt(req.params.id);
  const memo = memos.find(m => m.memoId === memoId);
  
  if (!memo) {
    return res.status(404).json({ 
      success: false,
      error: '메모를 찾을 수 없습니다' 
    });
  }
  
  res.json({
    success: true,
    data: {
      memoId: memo.memoId,
      content: memo.content,
      createdAt: memo.createdAt,
      updatedAt: memo.updatedAt,
      isPublic: memo.isPublic,
      fileUrl: memo.fileUrl,
      location: memo.location,
      user: memo.user
    }
  });
});

// 4. 메모 생성 (API 명세서에 맞춤)
app.post('/api/memos', authenticateToken, (req, res) => {
  const { 
    content, 
    is_public = false, 
    user_id, 
    location_name, 
    location_latitude, 
    location_longitude, 
    location_address, 
    location_category, 
    file_url = [] 
  } = req.body;
  
  // 필수 필드 검증
  if (!content || !location_name || !location_latitude || !location_longitude) {
    return res.status(400).json({
      success: false,
      error: '필수 필드가 누락되었습니다'
    });
  }
  
  const newMemo = {
    memoId: memos.length + 1,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: is_public,
    fileUrl: Array.isArray(file_url) ? file_url : [file_url].filter(Boolean),
    location: {
      name: location_name,
      latitude: location_latitude,
      longitude: location_longitude,
      address: location_address || '',
      category: location_category || ''
    },
    user: {
      userId: user_id || req.user.id,
      username: '테스트유저',
      photoUrl: null
    }
  };
  
  memos.push(newMemo);
  
  res.status(201).json({
    success: true,
    data: newMemo
  });
});

// 5. 메모 수정 (PUT 메서드 - API 명세서에 맞춤)
app.put('/api/memos/:id', authenticateToken, (req, res) => {
  const memoId = parseInt(req.params.id);
  const memoIndex = memos.findIndex(m => m.memoId === memoId);
  
  if (memoIndex === -1) {
    return res.status(404).json({ 
      success: false,
      error: '메모를 찾을 수 없습니다' 
    });
  }
  
  const { content, is_public, remain_photo_ids = [], new_photo_urls = [] } = req.body;
  
  // 메모 업데이트
  const updatedMemo = { ...memos[memoIndex] };
  if (content !== undefined) updatedMemo.content = content;
  if (is_public !== undefined) updatedMemo.isPublic = is_public;
  
  // 사진 처리 (기존 사진 중 남길 것들 + 새로운 사진들)
  const existingPhotos = updatedMemo.fileUrl || [];
  const remainingPhotos = existingPhotos.filter((_, index) => remain_photo_ids.includes(index));
  updatedMemo.fileUrl = [...remainingPhotos, ...new_photo_urls];
  
  updatedMemo.updatedAt = new Date().toISOString();
  memos[memoIndex] = updatedMemo;
  
  res.json({
    success: true,
    data: updatedMemo
  });
});

// 6. 메모 삭제 (API 명세서에 맞춤 - POST 메서드)
app.post('/api/memo/delete/:id', authenticateToken, (req, res) => {
  const memoId = parseInt(req.params.id);
  const memoIndex = memos.findIndex(m => m.memoId === memoId);
  
  if (memoIndex === -1) {
    return res.status(404).json({ 
      success: false,
      error: '메모를 찾을 수 없습니다' 
    });
  }
  
  // 메모 삭제
  memos.splice(memoIndex, 1);
  
  res.json({
    success: true,
    data: 0, // API 명세서에 따라 0 반환
    error: "string"
  });
});

// 서버 상태 확인
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '서버가 정상적으로 실행 중입니다',
    timestamp: new Date().toISOString(),
    data: {
      totalMemos: memos.length,
      totalUsers: users.length
    }
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 GeoMemo 모의 서버가 포트 ${PORT}에서 실행 중입니다`);
  console.log(`📡 API 엔드포인트: http://localhost:${PORT}/api`);
  console.log(`🔍 서버 상태 확인: http://localhost:${PORT}/api/health`);
});
