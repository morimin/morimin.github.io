$(document).ready(function() {
    var activeTab = $('.nav-tabs .active').attr('href');
    if (activeTab === '#listView') {
        loadPinList();
    } else if (activeTab === '#mapView') {
        loadPins();
    } else if (activeTab === '#registerView' && registerMap) {
        setTimeout(function() {
            registerMap.relayout();
            registerMap.setCenter(new kakao.maps.LatLng(37.5665, 126.9780));
        }, 0);
    }
});

// 탭 전환 시 이벤트 처리
$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
    var target = $(e.target).attr("href");
    if (target === '#listView') {
        loadPinList();
    } else if (target === '#mapView') {
        if (!map) {
            initializeMap();
        } else {
            loadPins();
            setTimeout(function() {
                map.relayout();
            }, 0);
        }
    } else if (target === '#registerView' && registerMap) {
        setTimeout(function() {
            registerMap.relayout();
            registerMap.setCenter(new kakao.maps.LatLng(37.5665, 126.9780));
        }, 0);
    }
});

// 지도 객체를 저장할 변수
var map = null;

// 지도 보기 탭의 지도 초기화 함수
function initializeMap() {
    var mapContainer = document.getElementById('map'); // 지도 보기 탭의 지도 div
    var mapOption = {
        center: new kakao.maps.LatLng(37.5665, 126.9780), // 기본 중심좌표 (서울)
        level: 5 // 확대 레벨
    };
    map = new kakao.maps.Map(mapContainer, mapOption);

    // 현재 위치로 이동하고 빨간색 마커 표시
    setCurrentLocation(map);

    // 핀 로드
    loadPins();
}

// 장소등록 탭의 지도 생성 (로그인한 사용자만 접근 가능)
var registerMapContainer = document.getElementById('registerMap');
var registerMap = null;
var registerMarker = null;

if (registerMapContainer) {
    var mapOptionRegister = {
        center: new kakao.maps.LatLng(37.5665, 126.9780), // 기본 중심좌표 (서울)
        level: 5 // 확대 레벨
    };
    registerMap = new kakao.maps.Map(registerMapContainer, mapOptionRegister);

    // 현재 위치로 이동하고 빨간색 마커 표시
    setCurrentLocation(registerMap);
}

// 현재 위치를 저장할 변수
var currentPosition = null;

// 위치 권한이 없을 때 메시지를 표시하는 함수
function showLocationPermissionMessage() {
    // 메시지 요소를 보여줌
    $('#locationMessage').show();
    // 팝업으로 알림
    alert('위치권한이 필요합니다.');
}

// 현재 위치를 가져와 지도의 중심을 설정하고 빨간색 마커를 표시하는 함수
function setCurrentLocation(targetMap) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;

            currentPosition = new kakao.maps.LatLng(lat, lon);
            targetMap.setCenter(currentPosition);

            // 빨간색 마커 이미지 생성
            var imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png';
            var imageSize = new kakao.maps.Size(64, 69);
            var imageOption = { offset: new kakao.maps.Point(27, 69) };
            var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

            // 현재 위치에 마커 생성
            new kakao.maps.Marker({
                position: currentPosition,
                image: markerImage,
                map: targetMap
            });
        }, function(error) {
            console.error('현재 위치를 가져올 수 없습니다.', error);
            showLocationPermissionMessage();
        });
    } else {
        showLocationPermissionMessage();
    }
}

// 마커들을 저장할 배열
var markers = [];

// 별점을 별 아이콘으로 변환하는 함수
function getStars(rating) {
    var stars = '';
    for (var i = 1; i <= 5; i++) {
        if (rating >= i) {
            stars += '<i class="fas fa-star"></i>';
        } else if (rating >= i - 0.5) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// 기존 핀 로드 함수
function loadPins() {
    // 기존 마커 제거
    markers.forEach(function(marker) {
        marker.setMap(null);
    });
    markers = [];

    $.get('/pins', function(data) {
        data.forEach(function(pin) {
            addMarker(pin);
        });
    }).fail(function(error) {
        console.error('Error loading pins:', error);
    });
}

// 페이지 로드 시 핀 로드
loadPins();

// 마커를 추가하는 함수
function addMarker(pin) {
    var position = new kakao.maps.LatLng(pin.latitude, pin.longitude);
    var marker = new kakao.maps.Marker({ position: position });
    marker.setMap(map);
    markers.push(marker);

    var iwContent = `<div style="padding:5px;">
                        <strong>상호명:</strong> ${pin.store_name}<br>
                        <strong>별점:</strong> ${getStars(pin.rating)}<br>
                        <strong>코멘트:</strong> ${pin.comment}
                     </div>`;
    var infowindow = new kakao.maps.InfoWindow({ content: iwContent });

    kakao.maps.event.addListener(marker, 'mouseover', function() {
        infowindow.open(map, marker);
    });
    kakao.maps.event.addListener(marker, 'mouseout', function() {
        infowindow.close();
    });
}

// 장소등록 탭의 지도 클릭 이벤트 리스너 추가 (로그인한 경우)
if (registerMap) {
    kakao.maps.event.addListener(registerMap, 'click', function(mouseEvent) {
        var latitude = mouseEvent.latLng.getLat();
        var longitude = mouseEvent.latLng.getLng();

        if (registerMarker) {
            registerMarker.setPosition(mouseEvent.latLng);
        } else {
            registerMarker = new kakao.maps.Marker({
                position: mouseEvent.latLng,
                map: registerMap
            });
        }
        $('#latitude').val(latitude);
        $('#longitude').val(longitude);
    });

    // 장소등록 폼 제출 이벤트 처리
    $('#registerForm').on('submit', function(e) {
        e.preventDefault();

        var store_name = $('#storeName').val();
        var rating = parseFloat($('#rating').val());
        var comment = $('#comment').val();
        var latitude = parseFloat($('#latitude').val());
        var longitude = parseFloat($('#longitude').val());

        // 입력 검증
        if (isNaN(rating) || rating < 1.0 || rating > 5.0) {
            alert('별점은 1.0에서 5.0 사이의 숫자여야 합니다.');
            return;
        }
        if (isNaN(latitude) || isNaN(longitude)) {
            alert('지도에서 위치를 선택해주세요.');
            return;
        }

        // 서버에 데이터 전송
        $.ajax({
            url: '/pins',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                store_name: store_name,
                latitude: latitude,
                longitude: longitude,
                rating: rating,
                comment: comment
            })
        }).done(function(data) {
            if (data.status === 'success') {
                addMarker({ latitude, longitude, store_name, rating, comment });
                $('#registerForm')[0].reset();
                if (registerMarker) {
                    registerMarker.setMap(null);
                    registerMarker = null;
                }
                $('#latitude, #longitude').val('');
                alert('장소가 등록되었습니다.');
                $('#tabMenu a[href="#mapView"]').tab('show');
                loadPins();
            }
        }).fail(function(xhr) {
            if (xhr.status === 401) {
                alert('로그인이 필요합니다.');
            } else {
                console.error('Error adding pin:', xhr);
            }
        });
    });
}

// 두 좌표 간의 거리를 계산하는 함수 (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
    function toRad(Value) {
        return Value * Math.PI / 180;
    }
    var R = 6371;
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lng2 - lng1);
    var a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 핀 리스트를 표시하는 함수
function displayPinList(data) {
    var pinListDiv = $('#pinList');
    pinListDiv.empty();

    data.forEach(function(pin) {
        var distanceStr = pin.distance ? `${pin.distance.toFixed(2)} km` : '';
        var safeDestinationName = pin.store_name.replace(/'/g, "\\'");
        var pinHtml = `
            <div class="card mb-2">
                <div class="card-body">
                    <h5 class="card-title">${pin.store_name}</h5>
                    <p class="card-text">
                        별점: ${getStars(pin.rating)}<br>
                        코멘트: ${pin.comment}<br>
                        거리: ${distanceStr}
                    </p>
                    <button class="btn btn-primary mr-2" onclick="focusOnMap(${pin.latitude}, ${pin.longitude})">지도에서 보기</button>
                    <button class="btn btn-success mr-2" onclick="getDirections(${pin.latitude}, ${pin.longitude}, '${safeDestinationName}')">길찾기</button>
                    <button class="btn btn-info" onclick="showComments(${pin.id}, '${safeDestinationName}')">
                        <i class="fas fa-comment"></i> ${pin.comment_count}
                    </button>
                </div>
            </div>
        `;
        pinListDiv.append(pinHtml);
    });
}

// 위치 정보 없이 핀 리스트를 로드하는 함수
function loadPinListWithoutLocation() {
    $.get('/pin_list', function(data) {
        displayPinList(data);
    }).fail(function(error) {
        console.error('Error loading pin list:', error);
    });
}

// 리스트 보기에 핀 데이터를 표시하는 함수
function loadPinList() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var userLat = position.coords.latitude;
            var userLng = position.coords.longitude;

            $.get('/pin_list', function(data) {
                data.forEach(function(pin) {
                    pin.distance = calculateDistance(userLat, userLng, pin.latitude, pin.longitude);
                });
                data.sort(function(a, b) { return a.distance - b.distance; });
                displayPinList(data);
            }).fail(function(error) {
                console.error('Error loading pin list:', error);
            });
        }, function(error) {
            console.error('현재 위치를 가져올 수 없습니다.', error);
            showLocationPermissionMessage();
            loadPinListWithoutLocation();
        });
    } else {
        showLocationPermissionMessage();
        loadPinListWithoutLocation();
    }
}

// 특정 위치로 지도를 이동하는 함수
function focusOnMap(latitude, longitude) {
    $('#tabMenu a[href="#mapView"]').tab('show');
    var moveLatLon = new kakao.maps.LatLng(latitude, longitude);
    map.setCenter(moveLatLon);
    map.setLevel(5);
}

// 길찾기 함수
function getDirections(destinationLat, destinationLng, destinationName = '목적지') {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var originLat = position.coords.latitude;
            var originLng = position.coords.longitude;
            var url = `https://map.kakao.com/?sName=현재위치&sX=${originLng}&sY=${originLat}&eName=${encodeURIComponent(destinationName)}&eX=${destinationLng}&eY=${destinationLat}&rpFlag=Y`;
            window.open(url, '_blank');
        }, function(error) {
            showLocationPermissionMessage();
            alert('위치권한이 필요합니다.');
            var url = `https://map.kakao.com/?eName=${encodeURIComponent(destinationName)}&eX=${destinationLng}&eY=${destinationLat}&rpFlag=Y`;
            window.open(url, '_blank');
        });
    } else {
        showLocationPermissionMessage();
        var url = `https://map.kakao.com/?eName=${encodeURIComponent(destinationName)}&eX=${destinationLng}&eY=${destinationLat}&rpFlag=Y`;
        window.open(url, '_blank');
    }
}

// 코멘트 모달 관련 변수
var selectedPinId = null;
var selectedPinName = '';

// 코멘트 모달을 표시하는 함수
function showComments(pinId, pinName) {
    selectedPinId = pinId;
    selectedPinName = pinName;
    $('#commentModalLabel').text(`${pinName}의 코멘트`);
    loadComments(pinId);
    $('#commentModal').modal('show');
}

// 코멘트를 로드하는 함수
function loadComments(pinId) {
    $.get(`/pins/${pinId}/comments`, function(data) {
        var commentList = $('#commentList');
        commentList.empty();
        data.forEach(function(comment) {
            var commentContent = `<strong>${comment.author}</strong>: ${comment.content} <span class="text-muted">(${comment.created_at})</span>`;
            var deleteButton = '';
            if (isAdmin) {  // 불리언 타입으로 수정
                deleteButton = `<button class="btn btn-danger btn-sm" onclick="deleteComment(${comment.id})">삭제</button>`;
            }
            var commentHtml = `<li class="list-group-item d-flex justify-content-between align-items-center">
                                   <div>${commentContent}</div>
                                   ${deleteButton}
                               </li>`;
            commentList.append(commentHtml);
        });
    }).fail(function(error) {
        console.error('Error loading comments:', error);
    });
}

// 코멘트를 삭제하는 함수
function deleteComment(commentId) {
    if (!confirm('정말로 이 코멘트를 삭제하시겠습니까?')) {
        return;
    }
    $.ajax({
        url: `/comments/${commentId}`,
        method: 'DELETE'
    }).done(function(data) {
        if (data.status === 'success') {
            loadComments(selectedPinId);
            loadPinList();
        }
    }).fail(function(xhr) {
        if (xhr.status === 403) {
            alert('접근 권한이 없습니다.');
        } else if (xhr.status === 404) {
            alert('코멘트를 찾을 수 없습니다.');
        } else {
            alert('코멘트를 삭제하는 중 오류가 발생했습니다.');
        }
    });
}

// 코멘트 추가 버튼 클릭 이벤트 처리
$('#addCommentBtn').on('click', function() {
    var author = $('#commentAuthor').val().trim();
    var content = $('#newComment').val().trim();
    if (!author || !content) {
        alert('작성자와 코멘트를 모두 입력해주세요.');
        return;
    }
    $.ajax({
        url: `/pins/${selectedPinId}/comments`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ author: author, content: content })
    }).done(function(data) {
        if (data.status === 'success') {
            $('#commentAuthor, #newComment').val('');
            loadComments(selectedPinId);
            loadPinList();
        } else {
            alert('코멘트 추가에 실패했습니다.');
        }
    }).fail(function(xhr) {
        console.error('Error adding comment:', xhr);
    });
});
